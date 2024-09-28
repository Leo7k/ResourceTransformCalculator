let resourceCalculationInProgress = {};
let transformChains = {};
let useTpResourcesFirst = true;
function logicClearAll() {
	resourceCalculationInProgress = {};
	transformChains = {};
	modelClearAll();
}

function logicSetResourceDefinition(resource) {
	return modelSetResourceDefinition(resource);
}

function logicGetResourceDefinition(resName) {
	return modelGetResourceDefinition(resName);
}
function logicGetResourceDefinitions() {
	return modelGetResourceDefinitions();
}

function logicGetTransformPoints() {
	return modelGetTransformPoints();
}

function logicGetTransformPointsState() {
	return modelGetTransformPointsState();
}


function logicUpdateTransformPoints(transformPoints) {
	return modelSetTransformPoints(transformPoints);
}

function logicSaveTransformPoint(transformPoint) {
	return modelSaveTransformPoint(transformPoint);
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
		transformPoints: logicGetTransformPointsState()
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

function getTransformChainsForResource(resourceName, srcStateResources, chainLengthCutoffLimit) {
	let transformChain = [];
	if (resourceCalculationInProgress[resourceName]) {
		console.log(`Resource ${resourceName} calculation already in progress`);
		return transformChain;
	}
	if (chainLengthCutoffLimit < 1) {
		console.log(`Resource chain limit reached`);
		return transformChain;
	}
	resourceCalculationInProgress[resourceName] = true;
	console.log(`Resource ${resourceName} calculation started`);
	let transformPoints = logicGetTransformPoints();
	for (let tpoint in transformPoints) {
		let transformPoint = transformPoints[tpoint];
		console.log(transformPoint.transformRules);
		for (let transformRuleId in transformPoint.transformRules) {
			let transformRule = transformPoint.transformRules[transformRuleId];
			console.log(transformRuleId);
			if (transformRule.transformRuleDescriptor != null) {
				console.log(`Transform point ${tpoint} calculation start ${resourceName}, ${transformRule.transformRuleDescriptor[resourceName]}`);
			}
			let tpResourceTransformRules = null;
			if ((transformRule.transformRuleDescriptor != null) && (transformRule.transformRuleDescriptor[resourceName] != null) && (transformRule.transformRuleDescriptor[resourceName] > 0)) {
				tpResourceTransformRules = transformRule.transformRuleDescriptor;
			}
			let subchainUsed = false;
			let hasRequiredResources = true;
			if (tpResourceTransformRules != null) {
				let transformResult = transformRule.applyTransform(transformPoint, srcStateResources);
				if (transformResult) {
					let resourcesState = transformResult.resourcesState;
					let requiredCountMultiplier  = transformResult.requiredCountMultiplier;
					for (let intermediateResourceName in tpResourceTransformRules) {
						let currentOwnResourceCount = resourcesState.own[intermediateResourceName] || 0;
						if ((tpResourceTransformRules[intermediateResourceName] < 0) && (currentOwnResourceCount < 0)) {
							let underlyingTransformChain = getTransformChainsForResource(intermediateResourceName, resourcesState, chainLengthCutoffLimit -1);
							if (underlyingTransformChain.length > 0) {
								console.log(`Lack of required resource ${intermediateResourceName} in transform point ${tpoint}, required: ${requiredCountMultiplier*tpResourceTransformRules[intermediateResourceName]}, has: ${resourcesState.own[intermediateResourceName]}. We need to go deeper...`);
								underlyingTransformChain.unshift(new ResourceTransformChainLink(resourceName, "resource", [new ResourceTransformDescriptor(transformPoint, transformRule)], requiredCountMultiplier, srcStateResources, resourcesState));
								transformChain.push(new ResourceTransformChainLink(resourceName+"_chain", "chain", underlyingTransformChain));
								subchainUsed = true;
							}
							else {
								console.log(`Required resource ${intermediateResourceName} is not found in transform point ${tpoint}`);
								hasRequiredResources = false;
								break;
							}
						}
						else {
							console.log(`Enough resources of type ${intermediateResourceName} in transform point ${tpoint}, required: ${requiredCountMultiplier*tpResourceTransformRules[intermediateResourceName]}, has: ${srcStateResources.own[intermediateResourceName]}`);
						}
					}
					if (hasRequiredResources && !subchainUsed) {
						transformChain.push(new ResourceTransformChainLink(resourceName, "resource", [new ResourceTransformDescriptor(transformPoint, transformRule)], requiredCountMultiplier, srcStateResources, resourcesState));
					}
				}
			}
		}
	}
	resourceCalculationInProgress[resourceName] = false;
	return transformChain;
}