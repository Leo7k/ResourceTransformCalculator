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

function calculateTransformChains(chainLengthCutoffLimit, successProbabilityCutoff) {
	resourceCalculationInProgress = {};
	transformChains = {};
	let chainsForResource = {};
	let srcStateResources = {
		own: copyKeyValueTable(logicGetOwnResources()),
		transformPoints: logicGetTransformPointsState()
	};
	for (let resourceName in srcStateResources.own) {
		let ownResourceCount = srcStateResources.own[resourceName];
		if (ownResourceCount < 0) {
			chainsForResource[resourceName] = getTransformChainsForResource(resourceName, srcStateResources, chainLengthCutoffLimit, 1, successProbabilityCutoff);
			//break;
		}
	}
	return chainsForResource;
}

function getTransformChainsForResource(resourceName, srcStateResources, chainLengthCutoffLimit, currentSuccessProbability, successProbabilityCutoff) {
	let transformChain = [];
	if (resourceCalculationInProgress[resourceName]) {
		console.log(`Resource ${resourceName} calculation already in progress`);
		return transformChain;
	}
	if (chainLengthCutoffLimit < 1) {
		console.log(`Resource chain length limit reached`);
		return transformChain;
	}
	if (currentSuccessProbability < successProbabilityCutoff) {
		console.log(`Resource chain success probability limit reached`);
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
					let requiredCountMultiplier = transformResult.requiredCountMultiplier;
					let ruleSuccessProbability = 0;
					if (transformRule.applyMultiplierToSuccessProbability) {
						ruleSuccessProbability = Math.pow(transformRule.successProbability, requiredCountMultiplier);
					}
					else {
						ruleSuccessProbability = transformRule.successProbability;
					}
					let successProbabilityAfterRule = ruleSuccessProbability*currentSuccessProbability;
					let resourcesState = transformResult.resourcesState;
					for (let intermediateResourceName in tpResourceTransformRules) {
						let currentOwnResourceCount = resourcesState.own[intermediateResourceName] || 0;
						if ((tpResourceTransformRules[intermediateResourceName] < 0) && (currentOwnResourceCount < 0)) {
							let underlyingTransformChain = getTransformChainsForResource(intermediateResourceName, resourcesState, chainLengthCutoffLimit -1, successProbabilityAfterRule, successProbabilityCutoff);
							if (underlyingTransformChain.length > 0) {
								console.log(`Lack of required resource ${intermediateResourceName} in transform point ${tpoint}, required: ${requiredCountMultiplier*tpResourceTransformRules[intermediateResourceName]}, has: ${resourcesState.own[intermediateResourceName]}. We need to go deeper...`);
								underlyingTransformChain.unshift(new ResourceTransformChainLink(resourceName, "resource", [new ResourceTransformDescriptor(transformPoint, transformRule)], requiredCountMultiplier, currentSuccessProbability, srcStateResources, successProbabilityAfterRule, resourcesState));
								transformChain.push(new ResourceTransformChainLink(resourceName+"_chain", "chain", underlyingTransformChain, 1, successProbabilityAfterRule, resourcesState));
								subchainUsed = true;
							}
							else {
								console.log(`Required resource ${intermediateResourceName} is not found in transform point ${tpoint} with required minimal success probability ${successProbabilityCutoff}`);
								hasRequiredResources = false;
								break;
							}
						}
						else {
							console.log(`Enough resources of type ${intermediateResourceName} in transform point ${tpoint}, required: ${requiredCountMultiplier*tpResourceTransformRules[intermediateResourceName]}, has: ${srcStateResources.own[intermediateResourceName]}`);
						}
					}
					if (hasRequiredResources && (successProbabilityAfterRule > successProbabilityCutoff) && !subchainUsed) {
						transformChain.push(new ResourceTransformChainLink(resourceName, "resource", [new ResourceTransformDescriptor(transformPoint, transformRule)], requiredCountMultiplier, currentSuccessProbability, srcStateResources, successProbabilityAfterRule, resourcesState));
					}
				}
			}
		}
	}
	resourceCalculationInProgress[resourceName] = false;
	return transformChain;
}