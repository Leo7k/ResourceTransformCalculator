"use strict";
let print = console.log;
let resourceTransformPoints = {}
let myOwnResources = {}
let resourceCalculationInProgress = {};
let transformChains = {};

function clearAll() {
	resourceCalculationInProgress = {};
	transformChains = {};
}

function setResourceTransformPoints(transformPoints) {
	resourceTransformPoints = transformPoints;
	document.getElementById("transformPointsList").replaceChildren();
	for (let tpName in transformPoints) {
		addTransformPointsList(null, tpName, transformPoints[tpName]);
	}
}

function setMyOwnResources(ownResources) {
	myOwnResources = ownResources;
	let resourcesElement = document.getElementById("myResources");
	resourcesElement.replaceChildren();
	for (let resourceName in ownResources) {
		addOwnResource(null, resourceName, ownResources[resourceName]);
	}
}

function onTransformPointsFileSelected(event) {
	if (event.target.files.length != 0) {
		event.target.files[0].text().then(JSON.parse).then(setResourceTransformPoints);
	}
	return true;
}

function onOwnResourcesFileSelected(event) {
	if (event.target.files.length != 0) {
		event.target.files[0].text().then(JSON.parse).then(setMyOwnResources);
	}
	return true;
}

function addTransformPointsList(event, tpointName, resources) {
	let inputResourcesElement = document.createElement("fieldset");
	let inputResourcesLegendElement = document.createElement("legend");
	inputResourcesLegendElement.innerText = "Точка обмена / преобразования";
	inputResourcesElement.appendChild(inputResourcesLegendElement);
	inputResourcesElement.setAttribute("inputType", "resourcesElement");
	let labelTpointName = document.createElement("label");
	labelTpointName.innerHTML = "Имя точки:"
	let inputTpointName = document.createElement("input");
	inputTpointName.type = "text";
	inputTpointName.setAttribute("inputType", "tpointName");
	if (tpointName) {
		inputTpointName.value = tpointName;
	}
	labelTpointName.appendChild(inputTpointName);
	let buttonDelRes = document.createElement("button");
	buttonDelRes.innerHTML = "Удалить";
	buttonDelRes.type = "button";
	buttonDelRes.onclick = deleteParentBlock;
	let buttonAddChildResource = document.createElement("button");
	buttonAddChildResource.innerHTML = "Добавить ресурс";
	buttonAddChildResource.type = "button";
	buttonAddChildResource.onclick = addResource;
	inputResourcesElement.appendChild(labelTpointName);
	inputResourcesElement.appendChild(buttonDelRes);
	inputResourcesElement.appendChild(buttonAddChildResource);
	document.getElementById("transformPointsList").appendChild(inputResourcesElement);
	if (resources) {
		for (let resourceName in resources) {
			addResource(null, inputResourcesElement, resourceName, resources[resourceName]);
		}
	}
	return true;
}

function addOwnResource(event, resourceName, resourceCount) {
	let resourcesElement = document.getElementById("myResources");
	return addResource(event, resourcesElement, resourceName, resourceCount);
}

function addResource(event, appendTo, resourceName, resourceCount) {
	let resourceInputArea = document.createElement("div");
	resourceInputArea.setAttribute("inputType", "resourceElement");
	let labelResName = document.createElement("label");
	labelResName.innerHTML = "Имя ресурса:"
	let inputResName = document.createElement("input");
	inputResName.type = "text";
	inputResName.setAttribute("inputType", "resName");
	inputResName.required = true;
	if (resourceName) {
		inputResName.value = resourceName;
	}
	let labelResCount = document.createElement("label");
	labelResCount.innerHTML = "Количество:"
	let inputResCount = document.createElement("input");
	inputResCount.type = "number";
	inputResCount.required = true;
	inputResCount.setAttribute("inputType", "resCount");
	if (resourceCount !== undefined) {
		inputResCount.value = resourceCount;
	}
	else {
		inputResCount.value = 0;
	}
	let buttonDelRes = document.createElement("button");
	buttonDelRes.innerHTML = "Удалить";
	buttonDelRes.type = "button";
	buttonDelRes.onclick = deleteParentBlock;
	labelResName.appendChild(inputResName);
	labelResCount.appendChild(inputResCount);
	resourceInputArea.appendChild(labelResName);
	resourceInputArea.appendChild(labelResCount);
	resourceInputArea.appendChild(buttonDelRes);
	if (appendTo == null) {
		appendTo = event.target.parentElement;
	}
	appendTo.appendChild(resourceInputArea);
	return true;
}


function deleteParentBlock(event) {
	event.target.parentElement.remove();
	return true;
}

function copyKeyValueTable(originalTable) {
	let copyOfTable = {};
	for (let k in originalTable) {
		copyOfTable[k] = originalTable[k];
	}
	return copyOfTable;
}

function fillInAndCalculate(event) {
	clearAll();
	let myResourcesElementsList = document.getElementById("myResources").querySelectorAll("div[inputType='resourceElement']");
	let tpointElementList = document.getElementById("transformPointsList").querySelectorAll("fieldset[inputType='resourcesElement']");
	for (let i = 0; i < myResourcesElementsList.length; i++) {
		let resNameElement = myResourcesElementsList[i].querySelectorAll("label > input[inputType='resName']")[0];
		if (resNameElement.value != "") {
			let resCountElement = myResourcesElementsList[i].querySelectorAll("label > input[inputType='resCount']")[0];
			myOwnResources[resNameElement.value] = parseInt(resCountElement.value);
		}
	}
	for (let j = 0; j < tpointElementList.length; j++) {
		let tpointNameElement = tpointElementList[j].querySelectorAll("input[inputType='tpointName']")[0];
		if (tpointNameElement.value != "") {
			let transformPointResourcesElementList = tpointElementList[j].querySelectorAll("div[inputType='resourceElement']");
			if (resourceTransformPoints[tpointNameElement.value] == null) {
				resourceTransformPoints[tpointNameElement.value] = {};
			}
			let tableTpointTransformPointDesc = resourceTransformPoints[tpointNameElement.value];
			for (let k = 0; k < transformPointResourcesElementList.length; k++) {
				let resNameElement = transformPointResourcesElementList[k].querySelectorAll("input[inputType='resName']")[0];
				if (resNameElement.value != "") {
					let resCountElement = transformPointResourcesElementList[k].querySelectorAll("input[inputType='resCount']")[0];
					tableTpointTransformPointDesc[resNameElement.value] = parseInt(resCountElement.value);
					//print(`[${tpointNameElement.value}][${resNameElement.value}] = ${resCountElement.value}`);
				}
			}
		}
	}

	print(resourceTransformPoints);
	calculateTransformChains();
	return true;
}

function getTransformChainsForResource(resourceName, currentStateResources, requiredCount) {
	let transformChain = [];
	if (resourceCalculationInProgress[resourceName]) {
		print(`Resource ${resourceName} calculation already in progress: ${requiredCount}`);
		return transformChain;
	}
	//print(currentStateResources);
	resourceCalculationInProgress[resourceName] = true;
	print(`Resource ${resourceName} calculation started, required count: ${requiredCount}`);
	for (let tpoint in resourceTransformPoints) {
		print(`Transform point ${tpoint} calculation start ${resourceName}, ${resourceTransformPoints[tpoint][resourceName]}`);
		if ((resourceTransformPoints[tpoint][resourceName] != null) && (resourceTransformPoints[tpoint][resourceName] > 0)) {
			let hasRequiredResources = true;
			let subchainUsed = false;
			let resourcesState = copyKeyValueTable(currentStateResources);
			print(resourcesState);
			for (let rresrc in resourceTransformPoints[tpoint]) {
				if (resourcesState[rresrc]) {
					resourcesState[rresrc] += resourceTransformPoints[tpoint][rresrc]*requiredCount;
				}
				else {
					resourcesState[rresrc] = resourceTransformPoints[tpoint][rresrc]*requiredCount;
				}
			}
			print(resourcesState);
			for (let intermediateResourceName in resourceTransformPoints[tpoint]) {
				//print(intermediateResourceName);
				if (((resourceTransformPoints[tpoint][intermediateResourceName] < 0) && (currentStateResources[intermediateResourceName] === undefined)) || (currentStateResources[intermediateResourceName] < -resourceTransformPoints[tpoint][intermediateResourceName] * requiredCount)) {
					let underlyingTransformChain = getTransformChainsForResource(intermediateResourceName, resourcesState, (-currentStateResources[intermediateResourceName] || 0) -requiredCount*resourceTransformPoints[tpoint][intermediateResourceName]);
					if (underlyingTransformChain.length > 0) {
						print(`Lack of required resource ${intermediateResourceName} in transform point ${tpoint}, required: ${requiredCount*resourceTransformPoints[tpoint][intermediateResourceName]}, has: ${currentStateResources[intermediateResourceName]}. We need to go deeper...`);
						underlyingTransformChain.unshift({type: "resource", name: resourceName, tpoint: tpoint, transformDescriptor: [resourceTransformPoints[tpoint]], resourcesStateInitial: currentStateResources, resourcesStateResult: resourcesState});
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
				transformChain.push({type: "resource", name: resourceName, tpoint: tpoint, transformDescriptor: [resourceTransformPoints[tpoint]], resourcesStateInitial: currentStateResources, resourcesStateResult: resourcesState});
			}
		}
	}
	resourceCalculationInProgress[resourceName] = false;
	return transformChain;
}

function displayTransformChain(transformDescriptor, resultDataElement, index, subindexString) {
	if (subindexString == null) {
		subindexString = "";
	}
	else {
		subindexString = subindexString+".";
	}
	let transformDescriptionOutputElement;
	if (transformDescriptor.type == "resource") {
		let tpNameElement = document.createElement("div");
		tpNameElement.innerText = `${subindexString+index} Точка преобразования: ${transformDescriptor.tpoint}`;
		let transformPointDescriptionElement = document.createElement("div");
		transformPointDescriptionElement.innerText = `Описание преобразования / обмена: ${JSON.stringify(transformDescriptor.transformDescriptor[0])}`

		let srcResourcesStateElement = document.createElement("div");
		srcResourcesStateElement.innerHTML = `Собственные ресурсы до преобразования / обмена: <br/> ${JSON.stringify(transformDescriptor.resourcesStateInitial)}`;
		let destResourcesStateElement = document.createElement("div");
		destResourcesStateElement.innerHTML = `Собственные ресурсы после преобразования / обмена: <br/> ${JSON.stringify(transformDescriptor.resourcesStateResult)}`;
		let fragment = document.createDocumentFragment();
		fragment.appendChild(tpNameElement);
		fragment.appendChild(transformPointDescriptionElement);
		fragment.appendChild(srcResourcesStateElement);
		fragment.appendChild(destResourcesStateElement);
		fragment.appendChild(document.createElement("br"));
		resultDataElement.appendChild(fragment);
	}
	else 	if (transformDescriptor.type == "chain") {
		let transformDescriptionOutputElement = document.createElement("details");
		let summaryElement = document.createElement("summary");
		let subtreeElement = document.createElement("div");

		summaryElement.innerText = subindexString+index+" "+transformDescriptor.name;
		transformDescriptionOutputElement.appendChild(summaryElement);
		transformDescriptionOutputElement.appendChild(subtreeElement);
		resultDataElement.appendChild(transformDescriptionOutputElement);
		for (let i = 0; i < transformDescriptor.transformDescriptor.length; i++) {
			displayTransformChain(transformDescriptor.transformDescriptor[i], subtreeElement, i+1, subindexString+index);
		}
	}
}

function calculateTransformChains() {
	print("*** START ***");
	resourceCalculationInProgress = {};
	transformChains = {};

	let resultsElement = document.getElementById("results");
	resultsElement.replaceChildren();
	let rootChainsCount = 0;
	let tempResources = {};
	for (let resourceName in myOwnResources) {
		let ownResourcesCount = myOwnResources[resourceName];
		if (ownResourcesCount < 0) {
			let resultStr = document.createElement("div");
			let resultNameElement = document.createElement("span");
			let resultDataElement = document.createElement("div");
			resultNameElement.innerText = `Искомый ресурс: ${resourceName}`;
			let chains = getTransformChainsForResource(resourceName, myOwnResources, -ownResourcesCount);
			print(chains);
			if (chains != null) {
				for (let i = 0; i < chains.length; i++) {
					displayTransformChain(chains[i], resultDataElement, i + 1);
				}
			}
			//resultDataElement.innerHTML = JSON.stringify(getTransformChainsForResource(resourceName, myOwnResources, -ownResourcesCount));
			resultStr.appendChild(resultNameElement);
			resultStr.appendChild(resultDataElement);
			resultsElement.appendChild(resultStr);
		}
	}
}