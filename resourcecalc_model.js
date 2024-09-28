let model_resourceDefinitions = {};
let model_resourceTransformPoints = {};
let model_resourceTransformPointsState = {};
let model_myOwnResources = {};

function modelClearAll() {
	model_resourceTransformPointsState = {};
	model_myOwnResources = {};
	model_resourceTransformPoints = {};
	model_resourceDefinitions = {};
}

function modelGetTransformPoints() {
	return model_resourceTransformPoints;
}
function modelGetTransformPointsState() {
	return model_resourceTransformPointsState;
}
function modelGetResourceDefinitions() {
	return model_resourceDefinitions;
}
function modelGetResourceDefinition(resName) {
	return model_resourceDefinitions[resName];
}

function modelSetTransformPoints(transformPoints) {
	if (transformPoints != null) {
		model_resourceTransformPoints = transformPoints;
	}
}
function modelSaveTransformPoint(transformPoint) {
	if (transformPoint != null) {
		model_resourceTransformPoints[transformPoint.name] = transformPoint;
		model_resourceTransformPointsState[transformPoint.name] = transformPoint.resources;
	}
}

function modelSetResourceDefinition(resource) {
	if (resource != null) {
		model_resourceDefinitions[resource.name] = resource;
	}
}

function modelGetResourceDefinition(resName) {
	return model_resourceDefinitions[resName];
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