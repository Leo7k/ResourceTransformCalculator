let resourceCalculationInProgress = {};
let transformChains = {};
let useTpResourcesFirst = true;
function logicClearAll() {
	resourceCalculationInProgress = {};
	transformChains = {};
	modelClearAll();
}

function logicSetResourceDefinition(resName, isInteger, displayName, additionalData) {
	return modelSetResourceDefinition(resName, isInteger, displayName, additionalData);
}

function copyKeyValueTable(originalTable) {
	let copyOfTable = {};
	for (let k in originalTable) {
		let value = originalTable[k];
		if (typeof(value) == "object") {
			copyOfTable[k] = copyKeyValueTable(originalTable[k]);
		}
		else {
			copyOfTable[k] = originalTable[k];
		}
	}
	return copyOfTable;
}

function logicGetResourceDefinitions() {
	return modelGetResourceDefinitions();
}

function logicGetTransformPoints() {
	return modelGetTransformPoints();
}

function logicUpdateTransformPoints(transformPoints) {
	return modelSetTransformPoints(transformPoints);
}

function logicSetTransformPointTransformResourcesCount(transformPointName, resourceName, count) {
	return modelSetTransformPointTransformResourcesCount(transformPointName, resourceName, count);
}

function logicSetTransformPointOwnResourcesCount(transformPointName, resourceName, count) {
	return modelSetTransformPointOwnResourcesCount(transformPointName, resourceName, count);
}


function logicSetTransformPointCanTransform(transformPointName, canTransform) {
	return modelSetTransformPointCanTransform(transformPointName, canTransform);
}

function logicSetTransformPointCanExchange(transformPointName, canExchange) {
	return modelSetTransformPointCanExchange(transformPointName, canExchange);
}


function logicGetOwnResources() {
	return modelGetOwnResources();
}

function logicUpdateOwnResources(ownResources) {
	return modelSetOwnResources(ownResources);
}

function logicSetOwnResourceCount(resourceName, count) {
	return modelSetOwnResourceCount(resourceName, count);
}

function calculateTransformChains(chainLengthCutoffLimit) {
	resourceCalculationInProgress = {};
	transformChains = {};
	let chainsForResource = {};
	let resourcesState = {
		own: copyKeyValueTable(logicGetOwnResources()),
		transformPoints: logicGetTransformPoints()
	};
	for (let resourceName in resourcesState.own) {
		let ownResourceCount = resourcesState.own[resourceName];
		if (ownResourceCount < 0) {
			chainsForResource[resourceName] = getTransformChainsForResource(resourceName, resourcesState, chainLengthCutoffLimit);
			//break;
		}
	}
	return chainsForResource;
}

function getTransformChainsForResource(resourceName, currentStateResources, chainLengthCutoffLimit) {
	let transformChain = [];
	if (resourceCalculationInProgress[resourceName]) {
		print(`Resource ${resourceName} calculation already in progress`);
		return transformChain;
	}
	if (chainLengthCutoffLimit < 1) {
		print(`Resource chain limit reached`);
		return transformChain;
	}
	resourceCalculationInProgress[resourceName] = true;
	print(`Resource ${resourceName} calculation started`);
	let transformPoints = logicGetTransformPoints();
	let definitions = logicGetResourceDefinitions();
	for (let tpoint in transformPoints) {
		let transformPoint = transformPoints[tpoint];
		let tpResourceTransformRules = null;
		if (transformPoint.transform != null) {
			print(`Transform point ${tpoint} calculation start ${resourceName}, ${transformPoint.transform[resourceName]}`);
		}
		if ((transformPoint.transform != null) && (transformPoint.transform[resourceName] != null) && (transformPoint.transform[resourceName] > 0)) {
			tpResourceTransformRules = transformPoint.transform;
		}
		if (tpResourceTransformRules != null) {
			let hasRequiredResources = true;
			let subchainUsed = false;
			let resourcesState = copyKeyValueTable(currentStateResources);
			let tpExchangeResources = resourcesState.transformPoints[tpoint].resources || {};
			let tpIntegerResourcesPresentInTransformRules = false;
			let requiredCountMultiplier = 1;
			for (let rresrc in tpResourceTransformRules) {
				tpIntegerResourcesPresentInTransformRules = (definitions[rresrc].isInteger != false) || tpIntegerResourcesPresentInTransformRules;
				let currentOwnResourceCount = resourcesState.own[rresrc] || 0;
				let tpResourcesCount = tpResourceTransformRules[rresrc];
				if ((currentOwnResourceCount < 0) && (tpResourceTransformRules[rresrc] != 0)) {
					requiredCountMultiplier = Math.max(requiredCountMultiplier, -currentOwnResourceCount/tpResourcesCount);
				}
			}
			if (tpIntegerResourcesPresentInTransformRules) {
				requiredCountMultiplier = Math.ceil(requiredCountMultiplier);
			}
			print(`Required resources count multiplier: ${requiredCountMultiplier}`);
			let noTransformAfterExchange = false;
			let tPointResourcesEnoughForExchange = false;
			if (transformPoint.canExchange) {
				noTransformAfterExchange = true;
				tPointResourcesEnoughForExchange = true;
				for (let rresrc in tpResourceTransformRules) {
					let currentOwnResourceCount = resourcesState.own[rresrc] || 0;
					let operationResourcesCount = tpResourceTransformRules[rresrc] * requiredCountMultiplier;
					let tpExchangeResourcesCount = (tpExchangeResources[rresrc] || 0);
					if (((tpExchangeResourcesCount >= 0) && ((tpExchangeResourcesCount - operationResourcesCount) >= 0) || (tpExchangeResourcesCount < 0) && ((tpExchangeResourcesCount - operationResourcesCount) >= tpExchangeResourcesCount))) {
						if ((operationResourcesCount > 0) && ((currentOwnResourceCount + operationResourcesCount) < 0)) {
							noTransformAfterExchange = false;
						}
					}
					else {
						tPointResourcesEnoughForExchange = false;
					}
				}
				if (tPointResourcesEnoughForExchange) {
					for (let rresrc in tpResourceTransformRules) {
						let operationResourcesCount = tpResourceTransformRules[rresrc] * requiredCountMultiplier;
						let currentOwnResourceCount = resourcesState.own[rresrc] || 0;
						resourcesState.own[rresrc] = currentOwnResourceCount + operationResourcesCount;
						resourcesState.transformPoints[tpoint].resources[rresrc] = (resourcesState.transformPoints[tpoint].resources[rresrc] || 0) - operationResourcesCount;
					}					
				}
			}
			if ((transformPoint.canTransform) && (!noTransformAfterExchange)) {
				let tpResourcesUsedCount = {};
				if (useTpResourcesFirst) {
					for (let rresrc in tpResourceTransformRules) {
						let currentOwnResourceCount = resourcesState.own[rresrc] || 0;
						let currentTpResourceCount = tpExchangeResources[rresrc] || 0;
						if ((tpResourceTransformRules[rresrc] < 0) && (currentTpResourceCount > 0)) {
							tpResourcesUsedCount[rresrc] = -Math.min(currentTpResourceCount, tpResourceTransformRules[rresrc] * requiredCountMultiplier);
							tpExchangeResources[rresrc] = currentTpResourceCount - tpResourcesUsedCount[rresrc];
							resourcesState.own[rresrc] = currentOwnResourceCount + tpResourcesUsedCount[rresrc];
						}
					}
				}

				for (let rresrc in tpResourceTransformRules) {
					let currentOwnResourceCount = resourcesState.own[rresrc] || 0;
					let currentTpResourceCount = tpExchangeResources[rresrc] || 0;
					resourcesState.own[rresrc] = currentOwnResourceCount + tpResourceTransformRules[rresrc] * requiredCountMultiplier;
				}
			}
			for (let intermediateResourceName in tpResourceTransformRules) {
				let currentOwnResourceCount = resourcesState.own[intermediateResourceName] || 0;
				if ((tpResourceTransformRules[intermediateResourceName] < 0) && (currentOwnResourceCount < 0)) {
					let underlyingTransformChain = getTransformChainsForResource(intermediateResourceName, resourcesState, chainLengthCutoffLimit -1);
					if (underlyingTransformChain.length > 0) {
						print(`Lack of required resource ${intermediateResourceName} in transform point ${tpoint}, required: ${requiredCountMultiplier*tpResourceTransformRules[intermediateResourceName]}, has: ${resourcesState.own[intermediateResourceName]}. We need to go deeper...`);
						underlyingTransformChain.unshift({type: "resource", name: resourceName, tpoint: tpoint, multiplier: requiredCountMultiplier, transformDescriptor: [transformPoint], resourcesStateInitial: currentStateResources, resourcesStateResult: resourcesState});
						transformChain.push({type: "chain", name: resourceName+"_chain", transformDescriptor: underlyingTransformChain});
						subchainUsed = true;
					}
					else {
						print(`Required resource ${intermediateResourceName} is not found in transform point ${tpoint}`);
						hasRequiredResources = false;
						break;
					}
				}
				else {
					print(`Enough resources of type ${intermediateResourceName} in transform point ${tpoint}, required: ${requiredCountMultiplier*tpResourceTransformRules[intermediateResourceName]}, has: ${currentStateResources.own[intermediateResourceName]}`);
				}
			}
			if (hasRequiredResources && !subchainUsed && (transformPoint.canTransform || tPointResourcesEnoughForExchange)) {
				transformChain.push({type: "resource", name: resourceName, tpoint: tpoint, multiplier: requiredCountMultiplier, transformDescriptor: [transformPoint], resourcesStateInitial: currentStateResources, resourcesStateResult: resourcesState});
			}
		}
	}
	resourceCalculationInProgress[resourceName] = false;
	return transformChain;
}