let model_resourceTransformPoints = {};
let model_myOwnResources = {};


function modelClearAll() {
	model_resourceTransformPoints = {};
	model_myOwnResources = {};
}

function modelGetTransformPoints() {
	return model_resourceTransformPoints;
}

function modelSetTransformPoints(transformPoints) {
	if (transformPoints != null) {
		model_resourceTransformPoints = transformPoints;
	}
}

function modelSetTransformPointCanExchange(transformPointName, canExchange) {
	if (transformPointName != null) {
		if (model_resourceTransformPoints[transformPointName] == null) {
			model_resourceTransformPoints[transformPointName] = {};
		}
		model_resourceTransformPoints[transformPointName].canExchange = (canExchange == true);
	}
}

function modelSetTransformPointCanTransform(transformPointName, canTransform) {
	if (transformPointName != null) {
		if (model_resourceTransformPoints[transformPointName] == null) {
			model_resourceTransformPoints[transformPointName] = {};
		}
		model_resourceTransformPoints[transformPointName].canTransform = (canTransform == true);
	}
}


function modelSetTransformPointTransformResourcesCount(transformPointName, resourceName, count) {
	if ((transformPointName != null) && (resourceName != null) && (count !== undefined) && (count !== null)) {
		if (model_resourceTransformPoints[transformPointName] == null) {
			model_resourceTransformPoints[transformPointName] = {};
		}
		const transformPoint = model_resourceTransformPoints[transformPointName];
		if (transformPoint.canExchange === undefined) {
			transformPoint.canExchange = false;
		}
		if (transformPoint.transform == undefined) {
			transformPoint.transform = {};
		}
		transformPoint.transform[resourceName] = count;
	}
}

function modelSetTransformPointOwnResourcesCount(transformPointName, resourceName, count) {
	if ((transformPointName != null) && (resourceName != null) && (count !== undefined) && (count !== null)) {
		if (model_resourceTransformPoints[transformPointName] == null) {
			model_resourceTransformPoints[transformPointName] = {};
		}
		const transformPoint = model_resourceTransformPoints[transformPointName];
		if (transformPoint.canExchange === undefined) {
			transformPoint.canExchange = false;
		}
		if (transformPoint.resources == undefined) {
			transformPoint.resources = {};
		}
		transformPoint.resources[resourceName] = count;
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