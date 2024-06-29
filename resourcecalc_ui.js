"use strict";
let print = console.log;

function setResourceTransformPoints(transformPoints) {
	logicUpdateTransformPoints(transformPoints);
	document.getElementById("transformPointsList").replaceChildren();
	for (let tpName in transformPoints) {
		addTransformPointsList(null, tpName, transformPoints[tpName]);
	}
}

function setMyOwnResources(ownResources) {
	logicUpdateOwnResources(ownResources);
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

function getOwnResourcesFromUI() {
	let myResourcesElementsList = document.getElementById("myResources").querySelectorAll("div[inputType='resourceElement']");
	for (let i = 0; i < myResourcesElementsList.length; i++) {
		let resNameElement = myResourcesElementsList[i].querySelectorAll("label > input[inputType='resName']")[0];
		if (resNameElement.value != "") {
			let resCountElement = myResourcesElementsList[i].querySelectorAll("label > input[inputType='resCount']")[0];
			logicSetOwnResourceCount(resNameElement.value, parseInt(resCountElement.value));
		}
	}
}

function getTransformPointsFromUI() {
	let tpointElementList = document.getElementById("transformPointsList").querySelectorAll("fieldset[inputType='resourcesElement']");
	for (let j = 0; j < tpointElementList.length; j++) {
		let tpointNameElement = tpointElementList[j].querySelectorAll("input[inputType='tpointName']")[0];
		if (tpointNameElement.value != "") {
			let transformPointResourcesElementList = tpointElementList[j].querySelectorAll("div[inputType='resourceElement']");
			for (let k = 0; k < transformPointResourcesElementList.length; k++) {
				let resNameElement = transformPointResourcesElementList[k].querySelectorAll("input[inputType='resName']")[0];
				if (resNameElement.value != "") {
					let resCountElement = transformPointResourcesElementList[k].querySelectorAll("input[inputType='resCount']")[0];
					logicSetTransformPointResourcesCount(tpointNameElement.value, resNameElement.value, parseInt(resCountElement.value));
					//print(`[${tpointNameElement.value}][${resNameElement.value}] = ${resCountElement.value}`);
				}
			}
		}
	}
	print(logicGetTransformPoints());
}

function fillInAndCalculate(event) {
	clearAll();
	let chainLengthCutoffLimitElement = document.getElementById("chainLengthCutoff");
	getOwnResourcesFromUI();
	getTransformPointsFromUI();
	print("*** START ***");
	let chainsForResource = calculateTransformChains(chainLengthCutoffLimitElement.value);
	displayCalculationResults(event, chainsForResource);
	return true;
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

function displayCalculationResults(event, chainsForResource) {
	let resultsElement = document.getElementById("results");
	resultsElement.replaceChildren();
	for (let resourceName in chainsForResource) {
		let chains = chainsForResource[resourceName];
		let resultStr = document.createElement("div");
		let resultNameElement = document.createElement("span");
		let resultDataElement = document.createElement("div");
		resultNameElement.innerText = `Искомый ресурс: ${resourceName}`;
		print(chains);
		if (chains != null) {
			for (let i = 0; i < chains.length; i++) {
				displayTransformChain(chains[i], resultDataElement, i + 1);
			}
		}
		resultStr.appendChild(resultNameElement);
		resultStr.appendChild(resultDataElement);
		resultsElement.appendChild(resultStr);
	}
}