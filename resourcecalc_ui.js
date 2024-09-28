"use strict";
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
		addTransformPoint(null, tpName, transformPoints[tpName]);
	}
}

function onResourcesStateFileSelected(event) {
	if (event.target.files.length != 0) {
		event.target.files[0].text().then(JSON.parse).then(loadParsedResourcesState);
	}
	return true;
}

function addButtonUIControl(parentToAdd, eventHandlerOnClick, displayName) {
	let buttonElement = document.createElement("button");
	buttonElement.innerText = displayName;
	buttonElement.type = "button";
	buttonElement.onclick = eventHandlerOnClick;
	parentToAdd.appendChild(buttonElement);
	return buttonElement;
}

function addCheckboxUIControl(parentToAdd, type, name, displayName, defaultIsChecked) {
	let label = document.createElement("label");
	label.innerText = displayName;
	let input = document.createElement("input");
	input.type = "checkbox";
	if (name) {
		input.name = name;
	}
	if (type) {
		input.setAttribute("inputType", type);
	}
	if ((defaultIsChecked === true) || (defaultIsChecked === false)) {
		input.checked = defaultIsChecked;
	}
	label.appendChild(input);
	parentToAdd.appendChild(label);
	return label;
}

function addResourceListForElement(parentToAdd, resourcesOrTransforms) {
	if (resourcesOrTransforms) {
		for (let resourceName in resourcesOrTransforms) {
			addResource(null, parentToAdd, resourceName, resourcesOrTransforms[resourceName]);
		}
	}
}

function addTransformPointRule(event, appendTo, ruleId, rule) {
	let inputTransformRuleElement = document.createElement("fieldset");
	inputTransformRuleElement.setAttribute("inputType", "transformRuleContainer");
	let inputTransformRulesLegendElement = document.createElement("legend");
	inputTransformRulesLegendElement.innerText = "Правило преобразования";
	inputTransformRuleElement.appendChild(inputTransformRulesLegendElement);

	let labelRuleName = document.createElement("label");
	labelRuleName.innerText = "Имя / ID правила:"
	let inputRuleName = document.createElement("input");
	inputRuleName.type = "text";
	inputRuleName.setAttribute("inputType", "transformRuleName");
	if (ruleId) {
		inputRuleName.value = ruleId;
	}
	labelRuleName.appendChild(inputRuleName);

	inputTransformRuleElement.appendChild(labelRuleName);
	addButtonUIControl(inputTransformRuleElement, deleteParentBlock, "Удалить правило");
	inputTransformRuleElement.appendChild(document.createElement("br"));
	addCheckboxUIControl(inputTransformRuleElement, "ruleCanExchange", "", "Разрешен обмен ресурсами", rule && rule.canExchange);
	inputTransformRuleElement.appendChild(document.createElement("br"));
	addCheckboxUIControl(inputTransformRuleElement, "ruleCanTransform", "", "Разрешено преобразование ресурсов", rule && rule.canTransform);
	inputTransformRuleElement.appendChild(document.createElement("br"));
	addButtonUIControl(inputTransformRuleElement, addResource, "Добавить ресурс");
	addResourceListForElement(inputTransformRuleElement, rule && rule.transformRuleDescriptor);
	inputTransformRuleElement.appendChild(document.createElement("br"));
	if (appendTo == null) {
		appendTo = event.target.parentElement;
	}
	appendTo.appendChild(inputTransformRuleElement)
}

function addTransformPoint(event, tpointName, tpoint) {
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
	labelTpointName.innerText = "Имя точки:"
	let inputTpointName = document.createElement("input");
	inputTpointName.type = "text";
	inputTpointName.setAttribute("inputType", "tpointName");
	if (tpointName) {
		inputTpointName.value = tpointName;
	}
	labelTpointName.appendChild(inputTpointName);

	addButtonUIControl(inputExchangeRulesElement, addResource, "Добавить ресурс");
	inputTransformPointElement.appendChild(labelTpointName);
	inputTransformPointElement.appendChild(inputTransformRulesElement);
	addButtonUIControl(inputTransformRulesElement, addTransformPointRule, "Добавить правило");

	inputTransformPointElement.appendChild(inputExchangeRulesElement);
	addButtonUIControl(inputTransformPointElement, deleteParentBlock, "Удалить ресурс");

	document.getElementById("transformPointsList").appendChild(inputTransformPointElement);
	if (tpoint) {
		for (let ruleId in tpoint.transformRules) {
			addTransformPointRule(event, inputTransformRulesElement, ruleId, tpoint.transformRules[ruleId]);
		}
		addResourceListForElement(inputExchangeRulesElement, tpoint.resources);
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
	
	labelResName.appendChild(inputResName);
	labelResCount.appendChild(inputResCount);
	resourceInputArea.appendChild(document.createElement("hr"));
	resourceInputArea.appendChild(labelResName);
	resourceInputArea.appendChild(labelResCount);
	addButtonUIControl(resourceInputArea, deleteParentBlock, "Удалить ресурс");
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
			logicSetResourceDefinition(new Resource(resNameElement.value, resCountIsIntegerElement.checked, resDisplayNameElement.value));
		}
	}
}

function getOwnResourcesFromUI() {
	let myResourcesElementsList = document.getElementById("myResources").querySelectorAll("div[inputType='resourceElement']");
	for (let i = 0; i < myResourcesElementsList.length; i++) {
		let resNameElement = myResourcesElementsList[i].querySelectorAll("label > select[inputType='resName']")[0];
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
			let transformPointRules = tpointElementList[j].querySelectorAll("fieldset[inputType='transformRuleContainer']");
			let transformRules = {};
			for (let i = 0; i < transformPointRules.length; i++) {
				let transformDescriptor = {};
				let transformRuleResourcesElementList = transformPointRules[i].querySelectorAll("div[inputType='resourceElement']");
				let transformRuleName = transformPointRules[i].querySelectorAll("input[inputType='transformRuleName']")[0];
				let inputTpointCanTransform = transformPointRules[i].querySelectorAll("input[inputType='ruleCanTransform']")[0];
				let inputTpointCanExchange = transformPointRules[i].querySelectorAll("input[inputType='ruleCanExchange']")[0];
				for (let k = 0; k < transformRuleResourcesElementList.length; k++) {
					let resNameElement = transformRuleResourcesElementList[k].querySelectorAll("select[inputType='resName']")[0];
					if (resNameElement.value != "") {
						let resCountElement = transformRuleResourcesElementList[k].querySelectorAll("input[inputType='resCount']")[0];
						let resCount = 0;
						if (resCountElement.step < 1) {
							resCount = parseFloat(resCountElement.value);
						}
						else {
							resCount = parseInt(resCountElement.value);
						}
						transformDescriptor[resNameElement.value] = resCount;
						//console.log(`[${tpointNameElement.value}][${resNameElement.value}] = ${resCountElement.value}`);
					}
				}
				transformRules[transformRuleName.value] = new ResourceTransformRule(transformRuleName.value, transformDescriptor, inputTpointCanTransform.checked, inputTpointCanExchange.checked);
			}
			let tpointResources = {};
			let exchangePointResourcesElementList = tpointElementList[j].querySelectorAll("fieldset[inputType='exchangeRulesContainer'] > div[inputType='resourceElement']");
			for (let k = 0; k < exchangePointResourcesElementList.length; k++) {
				let resNameElement = exchangePointResourcesElementList[k].querySelectorAll("select[inputType='resName']")[0];
				if (resNameElement.value != "") {
					let resCountElement = exchangePointResourcesElementList[k].querySelectorAll("input[inputType='resCount']")[0];
					let resCount = 0;
					if (resCountElement.step < 1) {
						resCount = parseFloat(resCountElement.value);
					}
					else {
						resCount = parseInt(resCountElement.value);
					}
					tpointResources[resNameElement.value] = resCount;
					//console.log(`[${tpointNameElement.value}][${resNameElement.value}] = ${resCountElement.value}`);
				}
			}
			logicSaveTransformPoint(new ResourceTransformPoint(tpointNameElement.value, transformRules, tpointResources));
		}
	}
}

function exportInputDataToJSON(event) {
	logicClearAll();
	getResourceDefinitionsFromUI();
	getOwnResourcesFromUI();
	getTransformPointsFromUI();
	let stringifiedJSON = JSON.stringify({
		"definitions": logicGetResourceDefinitions(),
		"own": logicGetOwnResources(),
		"transformPoints": logicGetTransformPoints()		
	});
	//this.href = data:application/json;
	this.href = window.URL.createObjectURL(new Blob([stringifiedJSON], {type: 'application/json'}));
	this.download = "resourcesInputData.json";
	logicClearAll();
	return true;
}


function fillInAndCalculate(event) {
	logicClearAll();
	getResourceDefinitionsFromUI();
	getOwnResourcesFromUI();
	getTransformPointsFromUI();
	const chainLengthCutoffLimitElement = document.getElementById("chainLengthCutoff");
	console.log("*** START ***");
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

function displayTransformChain(definitions, chainLink, resultDataElement, index, subindexString) {
	if (subindexString == null) {
		subindexString = "";
	}
	else {
		subindexString = subindexString+".";
	}
	let transformDescriptionOutputElement;
	if (chainLink.type == "resource") {
		let tpNameElement = document.createElement("div");
		tpNameElement.innerText = `${subindexString+index} Точка: ${chainLink.transformDescriptors[0].transformPoint.name}`;
		let tpRuleNameElement = document.createElement("div");
		tpRuleNameElement.innerText = `${subindexString+index} Правило: ${chainLink.transformDescriptors[0].transformRule.name}`;
		let transformPointDescriptionElement = buildResourcesStateTable(chainLink.transformDescriptors[0].transformRule, "transformRuleDescriptor", "Описание преобразования / обмена:", definitions);
		let transformMultiplierCountElement = document.createElement("div");
		transformMultiplierCountElement.innerText = `Количество преобразований / обменов: ${chainLink.multiplier}`
		let comparisonInitialUITables = buildTransformDescriptorUITables(chainLink.resourcesStateInitial, definitions);
		let comparisonResultUITables = buildTransformDescriptorUITables(chainLink.resourcesStateResult, definitions);	

		let destOwnResourcesStateElement = buildResourcesStateTable(chainLink.resourcesStateResult, "own", "Собственные ресурсы:", definitions);
		let destTPResourcesStateElement = document.createElement("div");
		let destTPResourcesStateCaptionElement = document.createElement("span");
		destTPResourcesStateCaptionElement.innerText = "Ресурсы точек обмена:";
		destTPResourcesStateElement.appendChild(destTPResourcesStateCaptionElement);
		for (let tpName in chainLink.resourcesStateResult.transformPoints) {
			let tPoint = chainLink.resourcesStateResult.transformPoints[tpName];
			if (tPoint.resources != null) {
				let tpOwnResourceTable = buildResourcesStateTable(tPoint, "resources", tpName+":", definitions);
				destTPResourcesStateElement.appendChild(tpOwnResourceTable);
			}
		}

		let fragment = document.createDocumentFragment();
		fragment.appendChild(tpNameElement);
		fragment.appendChild(tpRuleNameElement);
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
	else 	if (chainLink.type == "chain") {
		let transformDescriptionOutputElement = document.createElement("details");
		let summaryElement = document.createElement("summary");
		let subtreeElement = document.createElement("div");

		summaryElement.innerText = subindexString+index+" "+chainLink.name;
		transformDescriptionOutputElement.appendChild(summaryElement);
		transformDescriptionOutputElement.appendChild(subtreeElement);
		resultDataElement.appendChild(transformDescriptionOutputElement);
		for (let i = 0; i < chainLink.transformDescriptors.length; i++) {
			displayTransformChain(definitions, chainLink.transformDescriptors[i], subtreeElement, i+1, subindexString+index);
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

function onDocumentLoaded() {
	document.getElementById("exportInputDataToJSON").addEventListener("click", exportInputDataToJSON);
}

window.addEventListener("load", onDocumentLoaded);