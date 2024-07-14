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

function addResourcesUIControls(parentToAdd, tpointName, tpoint) {
	let buttonAddChildResource = document.createElement("button");
	buttonAddChildResource.innerHTML = "Добавить ресурс";
	buttonAddChildResource.type = "button";
	buttonAddChildResource.onclick = addResource;
	parentToAdd.appendChild(buttonAddChildResource);
}

function addTransformRulesFromPoint(parentToAdd, tpointName, resourcesOrTransforms) {
	if (resourcesOrTransforms) {
		for (let resourceName in resourcesOrTransforms) {
			addResource(null, parentToAdd, resourceName, resourcesOrTransforms[resourceName]);
		}
	}
}

function addTransformPointsList(event, tpointName, tpoint) {
	let inputTransformPointElement = document.createElement("fieldset");
	let inputTransformPointLegendElement = document.createElement("legend");
	inputTransformPointElement.setAttribute("inputType", "transformPoint");
	inputTransformPointLegendElement.innerText = "Точка обмена / преобразования";
	inputTransformPointElement.appendChild(inputTransformPointLegendElement);

	let inputTransformRulesElement = document.createElement("fieldset");
	inputTransformRulesElement.setAttribute("inputType", "transformRulesContainer");
	let inputTransformRulesLegendElement = document.createElement("legend");
	inputTransformRulesLegendElement.innerText = "Правила преобразования";
	inputTransformRulesElement.appendChild(inputTransformRulesLegendElement);

	let inputExchangeRulesElement = document.createElement("fieldset");
	inputExchangeRulesElement.setAttribute("inputType", "exchangeRulesContainer");
	let inputExchangeRulesLegendElement = document.createElement("legend");
	inputExchangeRulesLegendElement.innerText = "Собственные ресурсы точки";
	inputExchangeRulesElement.appendChild(inputExchangeRulesLegendElement);

	let labelTpointName = document.createElement("label");
	labelTpointName.innerHTML = "Имя точки:"
	let inputTpointName = document.createElement("input");
	inputTpointName.type = "text";
	inputTpointName.setAttribute("inputType", "tpointName");
	if (tpointName) {
		inputTpointName.value = tpointName;
	}
	labelTpointName.appendChild(inputTpointName);

	let labelTpointCanExchange = document.createElement("label");
	labelTpointCanExchange.innerHTML = "Разрешен обмен ресурсами"
	let inputTpointCanExchange = document.createElement("input");
	inputTpointCanExchange.type = "checkbox";
	inputTpointCanExchange.setAttribute("inputType", "tpointCanExchange");
	labelTpointCanExchange.appendChild(inputTpointCanExchange);


	let labelTpointCanTransform = document.createElement("label");
	labelTpointCanTransform.innerHTML = "Разрешено преобразование ресурсов"
	let inputTpointCanTransform = document.createElement("input");
	inputTpointCanTransform.type = "checkbox";
	inputTpointCanTransform.setAttribute("inputType", "tpointCanTransform");
	labelTpointCanTransform.appendChild(inputTpointCanTransform);

	if (tpoint) {
		if (tpoint.canExchange) {
			inputTpointCanExchange.checked = true;
		}
		if (tpoint.canTransform) {
			inputTpointCanTransform.checked = true;
		}
	}


	let buttonDelRes = document.createElement("button");
	buttonDelRes.innerHTML = "Удалить";
	buttonDelRes.type = "button";
	buttonDelRes.onclick = deleteParentBlock;

	addResourcesUIControls(inputTransformRulesElement, tpointName, tpoint);
	addResourcesUIControls(inputExchangeRulesElement, tpointName, tpoint);

	inputTransformPointElement.appendChild(labelTpointName);
	inputTransformPointElement.appendChild(document.createElement("br"));
	inputTransformPointElement.appendChild(labelTpointCanExchange);
	inputTransformPointElement.appendChild(document.createElement("br"));
	inputTransformPointElement.appendChild(labelTpointCanTransform);
	inputTransformPointElement.appendChild(inputTransformRulesElement);
	inputTransformPointElement.appendChild(inputExchangeRulesElement);
	inputTransformPointElement.appendChild(buttonDelRes);

	document.getElementById("transformPointsList").appendChild(inputTransformPointElement);
	if (tpoint) {
		addTransformRulesFromPoint(inputTransformRulesElement, tpointName, tpoint.transform);
		addTransformRulesFromPoint(inputExchangeRulesElement, tpointName, tpoint.resources);
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
	let tpointElementList = document.getElementById("transformPointsList").querySelectorAll("fieldset[inputType='transformPoint']");
	for (let j = 0; j < tpointElementList.length; j++) {
		let tpointNameElement = tpointElementList[j].querySelectorAll("input[inputType='tpointName']")[0];
		if (tpointNameElement.value != "") {
			let inputTpointCanTransform = tpointElementList[j].querySelectorAll("input[inputType='tpointCanTransform']")[0];
			let inputTpointCanExchange = tpointElementList[j].querySelectorAll("input[inputType='tpointCanExchange']")[0];

			logicSetTransformPointCanTransform(tpointNameElement.value, inputTpointCanTransform.checked);
			logicSetTransformPointCanExchange(tpointNameElement.value, inputTpointCanExchange.checked);
			let transformPointResourcesElementList = tpointElementList[j].querySelectorAll("fieldset[inputType='transformRulesContainer'] > div[inputType='resourceElement']");
			for (let k = 0; k < transformPointResourcesElementList.length; k++) {
				let resNameElement = transformPointResourcesElementList[k].querySelectorAll("input[inputType='resName']")[0];
				if (resNameElement.value != "") {
					let resCountElement = transformPointResourcesElementList[k].querySelectorAll("input[inputType='resCount']")[0];
					logicSetTransformPointTransformResourcesCount(tpointNameElement.value, resNameElement.value, parseInt(resCountElement.value));
					//print(`[${tpointNameElement.value}][${resNameElement.value}] = ${resCountElement.value}`);
				}
			}
			transformPointResourcesElementList = tpointElementList[j].querySelectorAll("fieldset[inputType='exchangeRulesContainer'] > div[inputType='resourceElement']");
			for (let k = 0; k < transformPointResourcesElementList.length; k++) {
				let resNameElement = transformPointResourcesElementList[k].querySelectorAll("input[inputType='resName']")[0];
				if (resNameElement.value != "") {
					let resCountElement = transformPointResourcesElementList[k].querySelectorAll("input[inputType='resCount']")[0];
					logicSetTransformPointOwnResourcesCount(tpointNameElement.value, resNameElement.value, parseInt(resCountElement.value));
					//print(`[${tpointNameElement.value}][${resNameElement.value}] = ${resCountElement.value}`);
				}
			}
		}
	}
}

function fillInAndCalculate(event) {
	logicClearAll();
	getOwnResourcesFromUI();
	getTransformPointsFromUI();
	const chainLengthCutoffLimitElement = document.getElementById("chainLengthCutoff");
	print("*** START ***");
	displayCalculationResults(event, calculateTransformChains(chainLengthCutoffLimitElement.value));
	return true;
}

function buildResourcesStateTable(resourcesState, stateKey, captionText) {
	let resourcesStateTable = document.createElement("table");
	let resourcesStateCaption = resourcesStateTable.createCaption();
	resourcesStateCaption.innerHTML = captionText;
	let resourcesStateHeaderContainer = resourcesStateTable.createTHead();
	let resourcesStateHeaderRow = resourcesStateHeaderContainer.insertRow();

	let resourcesStateResNameHeader = document.createElement("th");
	resourcesStateResNameHeader.innerHTML = "Имя ресурса";
	let resourcesStateResCountHeader = document.createElement("th");
	resourcesStateResCountHeader.innerHTML = "Количество ресурса";

	resourcesStateHeaderRow.appendChild(resourcesStateResNameHeader);
	resourcesStateHeaderRow.appendChild(resourcesStateResCountHeader);

	let resourcesStateBodyContainer = resourcesStateTable.createTBody();
	for (let resName in resourcesState[stateKey]) {
		let resourceRow = resourcesStateBodyContainer.insertRow();
		let resNameCell = resourceRow.insertCell();
		resNameCell.innerHTML = resName;
		let resCountCell = resourceRow.insertCell();
		resCountCell.innerHTML = resourcesState[stateKey][resName];
	}
	return resourcesStateTable;
}

function buildTransformDescriptorUITables(transformDescriptorResourcesState) {
	let resultValue = {};
	let ownResourcesStateElement = buildResourcesStateTable(transformDescriptorResourcesState, "own", "Собственные ресурсы:");
	let transformPointResourcesStateUIElement = document.createElement("div");
	let transformPointResourcesStateUICaptionElement = document.createElement("span");
	transformPointResourcesStateUICaptionElement.innerHTML = "Ресурсы точек обмена:";
	transformPointResourcesStateUIElement.appendChild(transformPointResourcesStateUICaptionElement);
	for (let tpName in transformDescriptorResourcesState.transformPoints) {
		let tPoint = transformDescriptorResourcesState.transformPoints[tpName];
		if (tPoint.resources != null) {
			let tpOwnResourceTable = buildResourcesStateTable(tPoint, "resources", tpName+":");
			transformPointResourcesStateUIElement.appendChild(tpOwnResourceTable);
		}
	}
	resultValue.own = ownResourcesStateElement;
	resultValue.tPoints = transformPointResourcesStateUIElement;
	return resultValue;
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
		tpNameElement.innerText = `${subindexString+index} Точка преобразования: ${transformDescriptor.tpoint}, тип преобразования - единичный обмен`;

		let transformPointDescriptionElement = buildResourcesStateTable(transformDescriptor.transformDescriptor[0], "transform", "Описание преобразования / обмена:");
		let comparisonInitialUITables = buildTransformDescriptorUITables(transformDescriptor.resourcesStateInitial);
		let comparisonResultUITables = buildTransformDescriptorUITables(transformDescriptor.resourcesStateResult);	

		let destOwnResourcesStateElement = buildResourcesStateTable(transformDescriptor.resourcesStateResult, "own", "Собственные ресурсы:");
		let destTPResourcesStateElement = document.createElement("div");
		let destTPResourcesStateCaptionElement = document.createElement("span");
		destTPResourcesStateCaptionElement.innerHTML = "Ресурсы точек обмена:";
		destTPResourcesStateElement.appendChild(destTPResourcesStateCaptionElement);
		for (let tpName in transformDescriptor.resourcesStateResult.transformPoints) {
			let tPoint = transformDescriptor.resourcesStateResult.transformPoints[tpName];
			if (tPoint.resources != null) {
				let tpOwnResourceTable = buildResourcesStateTable(tPoint, "resources", tpName+":");
				destTPResourcesStateElement.appendChild(tpOwnResourceTable);
			}
		}
		let fragment = document.createDocumentFragment();
		fragment.appendChild(tpNameElement);
		fragment.appendChild(transformPointDescriptionElement);

		let stateComparisonTable = document.createElement("table");
		let stateComparisonTableHead = stateComparisonTable.createTHead();

		let stateComparisonBeforeHeader = document.createElement("th");
		stateComparisonBeforeHeader.innerHTML = "До преобразования / обмена:";
		let stateComparisonAfterHeader = document.createElement("th");
		stateComparisonAfterHeader.innerHTML = "После преобразования / обмена:";
		stateComparisonTableHead.appendChild(stateComparisonBeforeHeader);
		stateComparisonTableHead.appendChild(stateComparisonAfterHeader);

		let stateComparisonTableBody = stateComparisonTable.createTBody();
		let stateComparisonTableOwnResRow = stateComparisonTableBody.insertRow();
		stateComparisonTableOwnResRow.insertCell().appendChild(comparisonInitialUITables.own);
		stateComparisonTableOwnResRow.insertCell().appendChild(comparisonResultUITables.own);
		let stateComparisonTableTPResRow = stateComparisonTableBody.insertRow();
		stateComparisonTableTPResRow.insertCell().appendChild(comparisonInitialUITables.tPoints);
		stateComparisonTableTPResRow.insertCell().appendChild(comparisonResultUITables.tPoints);
		fragment.appendChild(stateComparisonTable);
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