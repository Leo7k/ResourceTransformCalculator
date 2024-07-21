"use strict";
const print = console.log;
const uiFormFieldsets = [
"myResources",
"transformPointsList",
"resourcesDefinitions"
];


function clearSrcDataFromUI() {
	for (let i = 0; i < uiFormFieldsets.length; i++) {
		let fieldset = document.getElementById(uiFormFieldsets[i]);
		if (fieldset) {
			fieldset.replaceChildren();
		}
	}
}

function loadParsedResourcesState(resourcesState) {
	clearSrcDataFromUI();
	const resourceDefinitions = resourcesState.definitions;
	const ownResources = resourcesState.own;
	const transformPoints = resourcesState.transformPoints;
	for (let resourceName in resourceDefinitions) {
		addResourceDefinition(null, resourceName, resourceDefinitions[resourceName].displayName, resourceDefinitions[resourceName].isInteger, resourceDefinitions[resourceName].additionalData);
	}
	for (let resourceName in ownResources) {
		addOwnResource(null, resourceName, ownResources[resourceName]);
	}
	for (let tpName in transformPoints) {
		addTransformPointsList(null, tpName, transformPoints[tpName]);
	}
}

function onResourcesStateFileSelected(event) {
	if (event.target.files.length != 0) {
		event.target.files[0].text().then(JSON.parse).then(loadParsedResourcesState);
	}
	return true;
}

function addResourcesUIControls(parentToAdd, tpointName, tpoint) {
	let buttonAddChildResource = document.createElement("button");
	buttonAddChildResource.innerText = "Добавить ресурс";
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
	inputTransformRulesLegendElement.innerText = "Правило преобразования";
	inputTransformRulesElement.appendChild(inputTransformRulesLegendElement);

	let inputExchangeRulesElement = document.createElement("fieldset");
	inputExchangeRulesElement.setAttribute("inputType", "exchangeRulesContainer");
	let inputExchangeRulesLegendElement = document.createElement("legend");
	inputExchangeRulesLegendElement.innerText = "Собственные ресурсы точки";
	inputExchangeRulesElement.appendChild(inputExchangeRulesLegendElement);

	let labelTpointName = document.createElement("label");
	labelTpointName.innerText = "Имя точки:"
	let inputTpointName = document.createElement("input");
	inputTpointName.type = "text";
	inputTpointName.setAttribute("inputType", "tpointName");
	if (tpointName) {
		inputTpointName.value = tpointName;
	}
	labelTpointName.appendChild(inputTpointName);

	let labelTpointCanExchange = document.createElement("label");
	labelTpointCanExchange.innerText = "Разрешен обмен ресурсами"
	let inputTpointCanExchange = document.createElement("input");
	inputTpointCanExchange.type = "checkbox";
	inputTpointCanExchange.setAttribute("inputType", "tpointCanExchange");
	labelTpointCanExchange.appendChild(inputTpointCanExchange);


	let labelTpointCanTransform = document.createElement("label");
	labelTpointCanTransform.innerText = "Разрешено преобразование ресурсов"
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
	buttonDelRes.innerText = "Удалить";
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

function onDefinitionResourceNameChange(event) {
	let allResourceDescriptorElements = document.querySelectorAll('#resourcesDefinitions > div[inputType="resourceElement"]');
	for (let i = 0; i<allResourceDescriptorElements.length; i++) {
		let containerElement = allResourceDescriptorElements[i];
		let resNameElement = containerElement.querySelectorAll('[inputType="resName"]')[0];
		let resDisplayNameElement = containerElement.querySelectorAll('[inputType="resDisplayName"]')[0];
		if (Object.is(resNameElement, this) || Object.is(resDisplayNameElement, this)) {
			setResourceOptionForAllInputs(i, this.value, resDisplayNameElement.value);
			break;
		}
	}
	return true;
}

function onResourceSelected(event, resName) {
	if (resName == undefined) {
		resName = this.value;
	}
	if ((resName === null) || (resName == undefined)) {
		return true;
	}
	let isInteger = false;
	let allResourceDescriptorElements = document.querySelectorAll('#resourcesDefinitions > div[inputType="resourceElement"]');
	for (let i = 0; i<allResourceDescriptorElements.length; i++) {
		let containerElement = allResourceDescriptorElements[i];
		let resNameElement = containerElement.querySelectorAll('[inputType="resName"]')[0];
		if (resNameElement.value == resName) {
			let resCountIsIntegerElement = containerElement.querySelectorAll('[inputType="resCountIsInteger"]')[0];
			let resCountElement = this.parentElement.parentElement.querySelectorAll('[inputType="resCount"]')[0];
			if (resCountIsIntegerElement.checked) {
				resCountElement.step = 1;
			}
			else {
				resCountElement.step = 0.01;
			}
			break;
		}
	}
	return true;
}

function setResourceIsIntegerForAllInputs(resourceId, isInteger) {
	let allContainerElements = document.querySelectorAll('div[inputType="resourceElement"]');
	for (let i = 0; i<allContainerElements.length; i++) {
		let containerElement = allContainerElements[i];
		if (containerElement.parentElement.id != "resourcesDefinitions") {
			let resCountElement = containerElement.querySelectorAll('[inputType="resCount"]')[0];
			let resNameElement = containerElement.querySelectorAll('[inputType="resName"]')[0];
			if ((resCountElement) && (resNameElement.selectedIndex == resourceId)) {
				if (isInteger) {
					resCountElement.step = 1;
					let currentValue = parseFloat(resCountElement.value);
					if (Math.floor(currentValue) != Math.ceil(currentValue)) {
						resCountElement.value = Math.floor(currentValue);
					}
				}
				else {
					resCountElement.step = 0.01;
				}
			}
		}
	}
}

function onResourceIsIntegerChange(event) {
	let allResourceDescriptorElements = document.querySelectorAll('#resourcesDefinitions > div[inputType="resourceElement"]');
	for (let i = 0; i<allResourceDescriptorElements.length; i++) {
		let containerElement = allResourceDescriptorElements[i];
		let resCountIsIntegerElement = containerElement.querySelectorAll('[inputType="resCountIsInteger"]')[0];
		if (Object.is(resCountIsIntegerElement, this)) {
			setResourceIsIntegerForAllInputs(i, this.checked);
			break;
		}
	}
	return true;
}

function addResourceDefinition(event, resourceName, resourceDisplayName, resourceIsInteger, additionalData) {
	let appendTo = document.getElementById("resourcesDefinitions");
	let resourceInputArea = document.createElement("div");
	resourceInputArea.setAttribute("inputType", "resourceElement");
	let labelResName = document.createElement("label");
	labelResName.innerText = "Внутреннее имя ресурса:"
	let inputResName = document.createElement("input");
	inputResName.type = "text";
	inputResName.setAttribute("inputType", "resName");
	inputResName.required = true;
	inputResName.addEventListener("change", onDefinitionResourceNameChange);
	if (resourceName) {
		inputResName.value = resourceName;
	}
	labelResName.appendChild(inputResName);
	let labelResDisplayName = document.createElement("label");
	labelResDisplayName.innerText = "Отображаемое имя ресурса:"
	let inputResDisplayName = document.createElement("input");
	inputResDisplayName.type = "text";
	inputResDisplayName.required = true;
	inputResDisplayName.setAttribute("inputType", "resDisplayName");
	inputResDisplayName.addEventListener("change", onDefinitionResourceNameChange);
	if (resourceDisplayName !== undefined) {
		inputResDisplayName.value = resourceDisplayName;
	}
	labelResDisplayName.appendChild(inputResDisplayName);
	let labelResCountIsInteger = document.createElement("label");
	let inputResCountIsInteger = document.createElement("input");
	inputResCountIsInteger.type = "checkbox";
	inputResCountIsInteger.setAttribute("inputType", "resCountIsInteger");
	labelResCountIsInteger.appendChild(inputResCountIsInteger);
	let labelSpan = document.createElement("span");
	labelSpan.innerText = " Количество ресурса измеряется только в целочисленных единицах";
	labelResCountIsInteger.appendChild(labelSpan);

	let buttonDelRes = document.createElement("button");
	buttonDelRes.innerText = "Удалить";
	buttonDelRes.type = "button";
	buttonDelRes.addEventListener("click", removeResourceOptionForAllInputs);
	buttonDelRes.addEventListener("click", deleteParentBlock);
	resourceInputArea.appendChild(document.createElement("hr"));
	resourceInputArea.appendChild(labelResName);
	resourceInputArea.appendChild(labelResDisplayName);
	resourceInputArea.appendChild(buttonDelRes);
	resourceInputArea.appendChild(document.createElement("br"));
	resourceInputArea.appendChild(labelResCountIsInteger);
	resourceInputArea.appendChild(document.createElement("hr"));
	if ((appendTo == null) && (event != null)) {
		appendTo = event.target.parentElement;
	}
	appendTo.appendChild(resourceInputArea);
	inputResCountIsInteger.addEventListener("change", onResourceIsIntegerChange);
	if (resourceIsInteger !== undefined) {
		inputResCountIsInteger.checked = resourceIsInteger;
	}
	else {
		inputResCountIsInteger.checked = true;
	}
	addResourceDescriptorOption();
	return true;
}

function addOwnResource(event, resourceName, resourceCount) {
	let resourcesElement = document.getElementById("myResources");
	return addResource(event, resourcesElement, resourceName, resourceCount);
}

function addResourceDescriptorOption() {
	let allContainerElements = document.querySelectorAll('div[inputType="resourceElement"]');
	for (let i = 0; i<allContainerElements.length; i++) {
		let containerElement = allContainerElements[i];
		if (containerElement.parentElement.id != "resourcesDefinitions") {
			let selectElements = containerElement.querySelectorAll('[inputType="resName"]')[0];
			if (selectElements) {
				selectElements.options.add(new Option());
			}
		}
	}
}

function removeResourceOptionForAllInputs() {
	let resourceId = -1;
	let curResName = this.parentElement.querySelectorAll('[inputType="resName"]')[0];
	let allResourceDescriptorElements = document.querySelectorAll('#resourcesDefinitions > div[inputType="resourceElement"]');
	for (let i = 0; i<allResourceDescriptorElements.length; i++) {
		let containerElement = allResourceDescriptorElements[i];
		let resNameElement = containerElement.querySelectorAll('[inputType="resName"]')[0];
		if (Object.is(resNameElement, curResName)) {
			resourceId = i
			break;
		}
	}
	if (resourceId < 0) {
		return;
	}

	let allContainerElements = document.querySelectorAll('div[inputType="resourceElement"]');
	for (let i = 0; i<allContainerElements.length; i++) {
		let containerElement = allContainerElements[i];
		if (containerElement.parentElement.id != "resourcesDefinitions") {
			let selectElements = containerElement.querySelectorAll('[inputType="resName"]')[0];
			if (selectElements) {
				selectElements.options.remove(resourceId);
			}
		}
	}
}

function setResourceOptionForAllInputs(resourceId, resourceName, displayName) {
	let allContainerElements = document.querySelectorAll('div[inputType="resourceElement"]');
	for (let i = 0; i<allContainerElements.length; i++) {
		let containerElement = allContainerElements[i];
		if (containerElement.parentElement.id != "resourcesDefinitions") {
			let selectElements = containerElement.querySelectorAll('[inputType="resName"]')[0];
			if (selectElements) {
				let opts = selectElements.options;
				if (opts[resourceId]) {
					opts[resourceId].text = displayName;
					opts[resourceId].value = resourceName;
				}
			}
		}
	}
}

function addResourceListToSelect(selectElement) {
	let allResourceDescriptorElements = document.querySelectorAll('#resourcesDefinitions > div[inputType="resourceElement"]');
	let opts = selectElement.options;
	for (let i = 0; i<allResourceDescriptorElements.length; i++) {
		let containerElement = allResourceDescriptorElements[i];
		let resNameElement = containerElement.querySelectorAll('[inputType="resName"]')[0];
		let resDisplayNameElement = containerElement.querySelectorAll('[inputType="resDisplayName"]')[0];
		let opt = new Option();
		opt.text = resDisplayNameElement.value;
		opt.value = resNameElement.value;
		opts.add(opt);
	}
}

function addResource(event, appendTo, resourceName, resourceCount) {
	let resourceInputArea = document.createElement("div");
	resourceInputArea.setAttribute("inputType", "resourceElement");
	let labelResName = document.createElement("label");
	labelResName.innerText = "Имя ресурса:"
	let inputResName = document.createElement("select");
	inputResName.setAttribute("inputType", "resName");
	inputResName.required = true;
	addResourceListToSelect(inputResName);
	inputResName.addEventListener("change", onResourceSelected);
	let labelResCount = document.createElement("label");
	labelResCount.innerText = "Количество:"
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
	buttonDelRes.innerText = "Удалить";
	buttonDelRes.type = "button";
	buttonDelRes.onclick = deleteParentBlock;
	labelResName.appendChild(inputResName);
	labelResCount.appendChild(inputResCount);
	resourceInputArea.appendChild(document.createElement("hr"));
	resourceInputArea.appendChild(labelResName);
	resourceInputArea.appendChild(labelResCount);
	resourceInputArea.appendChild(buttonDelRes);
	resourceInputArea.appendChild(document.createElement("hr"));
	if (appendTo == null) {
		appendTo = event.target.parentElement;
	}
	appendTo.appendChild(resourceInputArea);
	if (resourceName) {
		inputResName.value = resourceName;
		onResourceSelected.call(inputResName);
	}
	return true;
}


function deleteParentBlock(event) {
	event.target.parentElement.remove();
	return true;
}

function getResourceDefinitionsFromUI() {
	let resourceDefinitionsElementsList = document.getElementById("resourcesDefinitions").querySelectorAll("div[inputType='resourceElement']");
	for (let i = 0; i < resourceDefinitionsElementsList.length; i++) {
		let resNameElement = resourceDefinitionsElementsList[i].querySelectorAll("label > input[inputType='resName']")[0];
		let resDisplayNameElement = resourceDefinitionsElementsList[i].querySelectorAll("label > input[inputType='resDisplayName']")[0];
		let resCountIsIntegerElement = resourceDefinitionsElementsList[i].querySelectorAll("label > input[inputType='resCountIsInteger']")[0];
		if (resNameElement.value != "") {
			logicSetResourceDefinition(resNameElement.value, resCountIsIntegerElement.checked, resDisplayNameElement.value);
		}
	}
}

function getOwnResourcesFromUI() {
	let myResourcesElementsList = document.getElementById("myResources").querySelectorAll("div[inputType='resourceElement']");
	for (let i = 0; i < myResourcesElementsList.length; i++) {
		let resNameElement = myResourcesElementsList[i].querySelectorAll("label > select[inputType='resName']")[0];
		if (resNameElement == null) {
			print(myResourcesElementsList);
		}
		if (resNameElement.value != "") {
			let resCountElement = myResourcesElementsList[i].querySelectorAll("label > input[inputType='resCount']")[0];
			let resCount = 0;
			if (resCountElement.step < 1) {
				resCount = parseFloat(resCountElement.value);
			}
			else {
				resCount = parseInt(resCountElement.value);
			}
			logicSetOwnResourceCount(resNameElement.value, resCount);
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
				let resNameElement = transformPointResourcesElementList[k].querySelectorAll("select[inputType='resName']")[0];
				if (resNameElement.value != "") {
					let resCountElement = transformPointResourcesElementList[k].querySelectorAll("input[inputType='resCount']")[0];
					let resCount = 0;
					if (resCountElement.step < 1) {
						resCount = parseFloat(resCountElement.value);
					}
					else {
						resCount = parseInt(resCountElement.value);
					}

					logicSetTransformPointTransformResourcesCount(tpointNameElement.value, resNameElement.value, resCount);
					//print(`[${tpointNameElement.value}][${resNameElement.value}] = ${resCountElement.value}`);
				}
			}
			transformPointResourcesElementList = tpointElementList[j].querySelectorAll("fieldset[inputType='exchangeRulesContainer'] > div[inputType='resourceElement']");
			for (let k = 0; k < transformPointResourcesElementList.length; k++) {
				let resNameElement = transformPointResourcesElementList[k].querySelectorAll("select[inputType='resName']")[0];
				if (resNameElement.value != "") {
					let resCountElement = transformPointResourcesElementList[k].querySelectorAll("input[inputType='resCount']")[0];
					let resCount = 0;
					if (resCountElement.step < 1) {
						resCount = parseFloat(resCountElement.value);
					}
					else {
						resCount = parseInt(resCountElement.value);
					}
					logicSetTransformPointOwnResourcesCount(tpointNameElement.value, resNameElement.value, resCount);
					//print(`[${tpointNameElement.value}][${resNameElement.value}] = ${resCountElement.value}`);
				}
			}
		}
	}
}

function fillInAndCalculate(event) {
	logicClearAll();
	getResourceDefinitionsFromUI();
	getOwnResourcesFromUI();
	getTransformPointsFromUI();
	const chainLengthCutoffLimitElement = document.getElementById("chainLengthCutoff");
	print("*** START ***");
	displayCalculationResults(event, calculateTransformChains(chainLengthCutoffLimitElement.value));
	return true;
}

function buildResourcesStateTable(resourcesState, stateKey, captionText, definitions) {
	let resourcesStateTable = document.createElement("table");
	let resourcesStateCaption = resourcesStateTable.createCaption();
	resourcesStateCaption.innerText = captionText;
	let resourcesStateHeaderContainer = resourcesStateTable.createTHead();
	let resourcesStateHeaderRow = resourcesStateHeaderContainer.insertRow();

	let resourcesStateResNameHeader = document.createElement("th");
	resourcesStateResNameHeader.innerText = "Имя ресурса";
	let resourcesStateResCountHeader = document.createElement("th");
	resourcesStateResCountHeader.innerText = "Количество ресурса";

	resourcesStateHeaderRow.appendChild(resourcesStateResNameHeader);
	resourcesStateHeaderRow.appendChild(resourcesStateResCountHeader);

	let resourcesStateBodyContainer = resourcesStateTable.createTBody();
	for (let resName in resourcesState[stateKey]) {
		let resourceRow = resourcesStateBodyContainer.insertRow();
		let resNameCell = resourceRow.insertCell();
		resNameCell.innerText = definitions[resName].displayName;
		let resCountCell = resourceRow.insertCell();
		resCountCell.innerText = resourcesState[stateKey][resName];
	}
	return resourcesStateTable;
}

function buildTransformDescriptorUITables(transformDescriptorResourcesState, definitions) {
	let resultValue = {};
	let ownResourcesStateElement = buildResourcesStateTable(transformDescriptorResourcesState, "own", "Собственные ресурсы:", definitions);
	let transformPointResourcesStateUIElement = document.createElement("div");
	let transformPointResourcesStateUICaptionElement = document.createElement("span");
	transformPointResourcesStateUICaptionElement.innerText = "Ресурсы точек обмена:";
	transformPointResourcesStateUIElement.appendChild(transformPointResourcesStateUICaptionElement);
	for (let tpName in transformDescriptorResourcesState.transformPoints) {
		let tPoint = transformDescriptorResourcesState.transformPoints[tpName];
		if (tPoint.resources != null) {
			let tpOwnResourceTable = buildResourcesStateTable(tPoint, "resources", tpName+":", definitions);
			transformPointResourcesStateUIElement.appendChild(tpOwnResourceTable);
		}
	}
	resultValue.own = ownResourcesStateElement;
	resultValue.tPoints = transformPointResourcesStateUIElement;
	return resultValue;
}

function displayTransformChain(definitions, transformDescriptor, resultDataElement, index, subindexString) {
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

		let transformPointDescriptionElement = buildResourcesStateTable(transformDescriptor.transformDescriptor[0], "transform", "Описание преобразования / обмена:", definitions);
		let transformMultiplierCountElement = document.createElement("div");
		transformMultiplierCountElement.innerText = `Количество преобразований / обменов: ${transformDescriptor.multiplier}`
		console.log(transformDescriptor);
		let comparisonInitialUITables = buildTransformDescriptorUITables(transformDescriptor.resourcesStateInitial, definitions);
		let comparisonResultUITables = buildTransformDescriptorUITables(transformDescriptor.resourcesStateResult, definitions);	

		let destOwnResourcesStateElement = buildResourcesStateTable(transformDescriptor.resourcesStateResult, "own", "Собственные ресурсы:", definitions);
		let destTPResourcesStateElement = document.createElement("div");
		let destTPResourcesStateCaptionElement = document.createElement("span");
		destTPResourcesStateCaptionElement.innerText = "Ресурсы точек обмена:";
		destTPResourcesStateElement.appendChild(destTPResourcesStateCaptionElement);
		for (let tpName in transformDescriptor.resourcesStateResult.transformPoints) {
			let tPoint = transformDescriptor.resourcesStateResult.transformPoints[tpName];
			if (tPoint.resources != null) {
				let tpOwnResourceTable = buildResourcesStateTable(tPoint, "resources", tpName+":", definitions);
				destTPResourcesStateElement.appendChild(tpOwnResourceTable);
			}
		}

		let fragment = document.createDocumentFragment();
		fragment.appendChild(tpNameElement);

		fragment.appendChild(transformPointDescriptionElement);
		fragment.appendChild(transformMultiplierCountElement);
		let stateComparisonTable = document.createElement("table");
		let stateComparisonTableHead = stateComparisonTable.createTHead();

		let stateComparisonBeforeHeader = document.createElement("th");
		stateComparisonBeforeHeader.innerText = "До преобразования / обмена:";
		let stateComparisonAfterHeader = document.createElement("th");
		stateComparisonAfterHeader.innerText = "После преобразования / обмена:";
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
			displayTransformChain(definitions, transformDescriptor.transformDescriptor[i], subtreeElement, i+1, subindexString+index);
		}
	}
}

function displayCalculationResults(event, chainsForResource) {
	let resultsElement = document.getElementById("results");
	resultsElement.replaceChildren();
	let definitions = logicGetResourceDefinitions();
	for (let resourceName in chainsForResource) {
		let chains = chainsForResource[resourceName];
		let resultStr = document.createElement("div");
		let resultNameElement = document.createElement("span");
		let resultDataElement = document.createElement("div");
		resultNameElement.innerText = `Искомый ресурс: ${definitions[resourceName].displayName}`;
		if (chains != null) {
			for (let i = 0; i < chains.length; i++) {
				displayTransformChain(definitions, chains[i], resultDataElement, i + 1);
			}
		}
		resultStr.appendChild(resultNameElement);
		resultStr.appendChild(resultDataElement);
		resultsElement.appendChild(resultStr);
	}
}