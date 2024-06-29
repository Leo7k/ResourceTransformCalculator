let resourceCalculationInProgress = {};
let transformChains = {};

function clearAll() {
	resourceCalculationInProgress = {};
	transformChains = {};
}

function copyKeyValueTable(originalTable) {
	let copyOfTable = {};
	for (let k in originalTable) {
		copyOfTable[k] = originalTable[k];
	}
	return copyOfTable;
}

function logicGetTransformPoints() {
	return modelGetTransformPoints();
}

function logicUpdateTransformPoints(transformPoints) {
	return modelSetTransformPoints(transformPoints);
}

function logicSetTransformPointResourcesCount(transformPointName, resourceName, count) {
	return modelSetTransformPointResourcesCount(transformPointName, resourceName, count);
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
	let ownResources = logicGetOwnResources();
	for (let resourceName in ownResources) {
		let ownResourceCount = ownResources[resourceName];
		if (ownResourceCount < 0) {
			chainsForResource[resourceName] = getTransformChainsForResource(resourceName, ownResources, -ownResourceCount, chainLengthCutoffLimit);
		}
	}
	return chainsForResource;
}

function getTransformChainsForResource(resourceName, currentStateResources, requiredCount, chainLengthCutoffLimit) {
	let transformChain = [];
	if (resourceCalculationInProgress[resourceName]) {
		print(`Resource ${resourceName} calculation already in progress: ${requiredCount}`);
		return transformChain;
	}
	if (chainLengthCutoffLimit < 1) {
		print(`Resource chain limit reached`);
		return transformChain;
	}
	//print(currentStateResources);
	resourceCalculationInProgress[resourceName] = true;
	print(`Resource ${resourceName} calculation started, required count: ${requiredCount}`);
	let transformPoints = logicGetTransformPoints();
	for (let tpoint in transformPoints) {
		print(`Transform point ${tpoint} calculation start ${resourceName}, ${transformPoints[tpoint][resourceName]}`);
		if ((transformPoints[tpoint][resourceName] != null) && (transformPoints[tpoint][resourceName] > 0)) {
			let hasRequiredResources = true;
			let subchainUsed = false;
			let resourcesState = copyKeyValueTable(currentStateResources);
			print(resourcesState);
			for (let rresrc in transformPoints[tpoint]) {
				if (resourcesState[rresrc]) {
					resourcesState[rresrc] += transformPoints[tpoint][rresrc]*requiredCount;
				}
				else {
					resourcesState[rresrc] = transformPoints[tpoint][rresrc]*requiredCount;
				}
			}
			print(resourcesState);
			for (let intermediateResourceName in transformPoints[tpoint]) {
				//print(intermediateResourceName);
				if (((transformPoints[tpoint][intermediateResourceName] < 0) && (currentStateResources[intermediateResourceName] === undefined)) || (currentStateResources[intermediateResourceName] < -transformPoints[tpoint][intermediateResourceName] * requiredCount)) {
					let underlyingTransformChain = getTransformChainsForResource(intermediateResourceName, resourcesState, (-currentStateResources[intermediateResourceName] || 0) -requiredCount*transformPoints[tpoint][intermediateResourceName], chainLengthCutoffLimit -1);
					if (underlyingTransformChain.length > 0) {
						print(`Lack of required resource ${intermediateResourceName} in transform point ${tpoint}, required: ${requiredCount*transformPoints[tpoint][intermediateResourceName]}, has: ${currentStateResources[intermediateResourceName]}. We need to go deeper...`);
						underlyingTransformChain.unshift({type: "resource", name: resourceName, tpoint: tpoint, transformDescriptor: [transformPoints[tpoint]], resourcesStateInitial: currentStateResources, resourcesStateResult: resourcesState});
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
					print(`Enough resources of type ${intermediateResourceName} for ${resourceName}`);
				}
			}
			if (hasRequiredResources && !subchainUsed) {
				transformChain.push({type: "resource", name: resourceName, tpoint: tpoint, transformDescriptor: [transformPoints[tpoint]], resourcesStateInitial: currentStateResources, resourcesStateResult: resourcesState});
			}
		}
	}
	resourceCalculationInProgress[resourceName] = false;
	return transformChain;
}