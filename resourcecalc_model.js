let model_resourceDefinitions = {};
let model_resourceTransformPoints = {};
let model_myOwnResources = {};


function modelClearAll() {
	model_resourceTransformPoints = {};
	model_myOwnResources = {};
}

function modelGetTransformPoints() {
	return model_resourceTransformPoints;
}

function modelGetResourceDefinitions() {
	return model_resourceDefinitions;
}

function modelSetTransformPoints(transformPoints) {
	if (transformPoints != null) {
		model_resourceTransformPoints = transformPoints;
	}
}

function modelSetResourceDefinition(resName, isInteger, displayName, additionalData) {
	if (resName != null) {
		if (model_resourceDefinitions[resName] == null) {
			model_resourceDefinitions[resName] = {};
		}
		model_resourceDefinitions[resName].isInteger = (isInteger == true);
		model_resourceDefinitions[resName].displayName = displayName;
		model_resourceDefinitions[resName].additionalData = additionalData;
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