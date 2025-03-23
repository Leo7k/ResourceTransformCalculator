function copyKeyValueTable(originalTable) {
	let copyOfTable = {};
	for (let k in originalTable) {
		let value = originalTable[k];
		if (typeof(value) == "object") {
			copyOfTable[k] = copyKeyValueTable(originalTable[k]); //structuredClone?
		}
		else {
			copyOfTable[k] = originalTable[k];
		}
	}
	return copyOfTable;
}

class Resource {
	name;
	displayName;
	isInteger = true;
	constructor(name, isInteger, displayName) {
		this.name = name;
		this.displayName = displayName || name;
		this.isInteger = (isInteger !== false);
	}
}

class ResourceStoragePoint {
	name;
	resources = {};
	constructor(name, resources = {}) {
		this.name = name;
		this.resources = resources;
	}
}

class ResourceTransformRule {
	name;
	transformRuleDescriptor = {};
	#integerQuantityResourcesPresent = false;
	canTransform = true;
	canExchange = false;
	applyMultiplierToSuccessProbability = false;
	constructor(name, transformRuleDescriptor = {}, canTransform = true, canExchange = false, successProbability = 1, applyMultiplierToSuccessProbability = false, displayName) {
		this.name = name;
		this.displayName = displayName || name;
		this.canTransform = (canTransform !== false);
		this.canExchange = (canExchange === true);
		this.successProbability = successProbability;
		this.applyMultiplierToSuccessProbability = applyMultiplierToSuccessProbability;
		this.transformRuleDescriptor = transformRuleDescriptor;
		for (let rresrc in transformRuleDescriptor) {
			if (logicGetResourceDefinition(rresrc).isInteger) {
				this.#integerQuantityResourcesPresent = true;
				break;
			}
		}
	}

	applyTransform(transformPoint, currentStateResources) {
		let resourcesState = copyKeyValueTable(currentStateResources);
		let isSuccess = false;
		let transformPointName = transformPoint.name;
		let ownResourcesStateInitial = currentStateResources.own
		let transformRuleDescriptor = this.transformRuleDescriptor;
		let tpExchangeResources = resourcesState.transformPoints[transformPointName] || {}; // ????
		let requiredCountMultiplier = 1;
		for (const [resourceName, trDescriptorResourceCount] of Object.entries(transformRuleDescriptor)) {
			let currentOwnResourceCount = ownResourcesStateInitial[resourceName] || 0;
			if ((currentOwnResourceCount < 0) && (trDescriptorResourceCount != 0)) {
				requiredCountMultiplier = Math.max(requiredCountMultiplier, -currentOwnResourceCount/trDescriptorResourceCount);
			}
		}
		if (this.#integerQuantityResourcesPresent) {
			requiredCountMultiplier = Math.ceil(requiredCountMultiplier);
		}

		console.log(`Required resources count multiplier: ${requiredCountMultiplier}`);
		let noTransformAfterExchange = false;
		let transformPointHasEnoughResourcesForExchange = false;
		let ownResourcesStateResult = resourcesState.own;
		if (this.canExchange) {
			noTransformAfterExchange = true;
			transformPointHasEnoughResourcesForExchange = true;
			for (const [resourceName, trDescriptorResourceCount] of Object.entries(transformRuleDescriptor)) {
				let currentOwnResourceCount = ownResourcesStateResult[resourceName] || 0;
				let operationResourcesCount = trDescriptorResourceCount * requiredCountMultiplier;
				let tpExchangeResourcesCount = (tpExchangeResources[resourceName] || 0);
				if (((tpExchangeResourcesCount >= 0) && ((tpExchangeResourcesCount - operationResourcesCount) >= 0) || (tpExchangeResourcesCount < 0) && ((tpExchangeResourcesCount - operationResourcesCount) >= tpExchangeResourcesCount))) {
					if ((operationResourcesCount > 0) && ((currentOwnResourceCount + operationResourcesCount) < 0)) {
						noTransformAfterExchange = false;
					}
				}
				else {
					transformPointHasEnoughResourcesForExchange = false;
				}
			}
			if (transformPointHasEnoughResourcesForExchange) {
				for (const [resourceName, trDescriptorResourceCount] of Object.entries(transformRuleDescriptor)) {
					let operationResourcesCount = trDescriptorResourceCount * requiredCountMultiplier;
					let currentOwnResourceCount = ownResourcesStateResult[resourceName] || 0;
					ownResourcesStateResult[resourceName] = currentOwnResourceCount + operationResourcesCount;
					resourcesState.transformPoints[transformPointName][resourceName] = (resourcesState.transformPoints[transformPointName][resourceName] || 0) - operationResourcesCount;
				}
				isSuccess = true;
			}
		}
		if ((this.canTransform) && (!noTransformAfterExchange)) {
			let tpResourcesUsedCount = {};
			if (useTpResourcesFirst) {
				for (const [resourceName, trDescriptorResourceCount] of Object.entries(transformRuleDescriptor)) {
					let currentOwnResourceCount = ownResourcesStateResult[resourceName] || 0;
					let currentTpResourceCount = tpExchangeResources[resourceName] || 0;
					if ((trDescriptorResourceCount < 0) && (currentTpResourceCount > 0)) {
						tpResourcesUsedCount[resourceName] = -Math.min(currentTpResourceCount, trDescriptorResourceCount * requiredCountMultiplier);
						tpExchangeResources[resourceName] = currentTpResourceCount - tpResourcesUsedCount[resourceName];
						ownResourcesStateResult[resourceName] = currentOwnResourceCount + tpResourcesUsedCount[resourceName];
					}
				}
			}
			for (const [resourceName, trDescriptorResourceCount] of Object.entries(transformRuleDescriptor)) {
				let currentOwnResourceCount = ownResourcesStateResult[resourceName] || 0;
				let currentTpResourceCount = tpExchangeResources[resourceName] || 0;
				ownResourcesStateResult[resourceName] = currentOwnResourceCount + trDescriptorResourceCount * requiredCountMultiplier;
			}
			isSuccess = true;
		}
		if (isSuccess) {
			return {resourcesState: resourcesState, requiredCountMultiplier: requiredCountMultiplier};
		}
	}
}

class ResourceTransformPoint {
	name;
	displayName;
	transformRules = {};
	resources = {};
	constructor(name, transformRules = {}, resources = {}, displayName) {
		this.name = name;
		this.displayName = displayName || name;
		this.transformRules = transformRules;
		this.resources = resources;
	}
}

class ResourceTransformDescriptor {
	transformPoint;
	transformRule;
	constructor(transformPoint, transformRule) {
		this.transformPoint = transformPoint;
		this.transformRule = transformRule;
	}
}

class ResourceTransformChainLink {
	name;
	type;
	transformDescriptors;
	resourcesStateInitial = {};
	resourcesStateResult = {};
	multiplier = 1;
	successProbabilityInitial = 1;
	constructor(name, type, transformDescriptors, multiplier = 1, successProbabilityInitial = 1, resourcesStateInitial = {}, successProbabilityResult, resourcesStateResult = {}) {
		this.name = name;
		this.type = type;
		this.multiplier = multiplier || 1;
		this.transformDescriptors = transformDescriptors;
		this.resourcesStateInitial = resourcesStateInitial;
		this.successProbabilityInitial = successProbabilityInitial;
		this.resourcesStateResult = resourcesStateResult;
		this.successProbabilityResult = successProbabilityResult;
	}
}