let model_resourceTransformPoints = {}
let model_myOwnResources = {}

function modelGetTransformPoints() {
	return model_resourceTransformPoints;
}

function modelSetTransformPoints(transformPoints) {
	if (transformPoints != null) {
		model_resourceTransformPoints = transformPoints;
	}
}

function modelSetTransformPointResourcesCount(transformPointName, resourceName, count) {
	if ((transformPointName != null) && (resourceName != null) && (count !== undefined) && (count !== null)) {
		if (model_resourceTransformPoints[transformPointName] == null) {
			model_resourceTransformPoints[transformPointName] = {};
		}
		const transformPoint = model_resourceTransformPoints[transformPointName];
		transformPoint[resourceName] = count;
	}
}

function modelGetOwnResources() {
	return model_myOwnResources;
}

function modelSetOwnResources(ownResources) {
	if (ownResources != null) {
		model_myOwnResources = ownResources;
	}
}

function modelSetOwnResourceCount(resourceName, count) {
	if ((resourceName != null) && (count !== null) && (count !== undefined)) {
		model_myOwnResources[resourceName] = count;
	}
}