
// ==UserScript==
// @name         [GC] - TP Enhancements
// @namespace    https://greasyfork.org/en/users/1225524-kaitlin
// @match        https://www.grundos.cafe/island/tradingpost/*
// @version      1.0
// @license      MIT
// @description Tp
// @author       Cupkait
// @icon         https://i.imgur.com/4Hm2e6z.png
// @downloadURL https://update.greasyfork.org/scripts/501312/%5BGC%5D%20-%20TP%20Enhancements.user.js
// @updateURL https://update.greasyfork.org/scripts/501312/%5BGC%5D%20-%20TP%20Enhancements.meta.js
// ==/UserScript==




function pageCheck() {
const headerCheck = document.querySelector('.trading_post > div.header').textContent;

switch(headerCheck) {
    case '\nCreate a New Lot\n':
          initiateNewTrade();
        break;

    case '\nYour Lots\n':
          generateCancelButtons();
          generateSortElement();
        break;

    case '\nSelect Your Search Criteria\n':
        break;

    case '\nOffers You Have Made\n':
        break;

    case '\nOffers on Lot\n':
        break;

    case '\nMake an Offer on Lot\n':

    default:
        error();}
}
pageCheck();


function addGlobalStyles(){
const tradeStyles = document.createElement('style');
  //Insert any CSS styling that applies to newly created elements, etc.
  tradeStyles.innerHTML = `
  .cancelbtn, #sortSelect {
      margin:5px;
      width:47%;
      box-sizing: border-box;
      font-family: inherit;
      font-size: inherit;
      font-weight: normal;
      line-height: 1.5em;
      min-height: 1.5em;
}
.createbtn {
      margin:5px;
      width:75%;
      box-sizing: border-box;
      font-family: inherit;
      font-size: inherit;
      font-weight: normal;
      line-height: 1.5em;
      min-height: 1.5em;
}
.trade-lot {
border-top: 2px solid black;
}

#tradeSettings {
text-align:center !important;
padding: 10px;
}

#exitSettings {
height:auto;
width:75%;
margin:auto;}
#newContainer {
text-align:center;
}

#createFilter {
width: 70%;
margin-right:5px;
}

#submitBtn, #createBtn {

width: 45%;
margin:5px;
height:auto;

}
#checkedCounter {
text-transform:uppercase;
font-weight:bold;
margin:5px;
color:blue;
}

#selectFirst, #selectMax, #selectNone {
      margin:5px;
      height:auto;
      width:31%;
}

#wishlist {
width: 100%;
height: 1.5em;
}
#quicksale-neopoints {
width: 230px;
height: 1.5em;
margin-left: 10px;
}
.tp_header {
    text-align:center;
    margin: auto;
    margin-bottom:10px;
    width: 75%;
    overflow-wrap: break-word;
    padding: 4px;
}
.tp_header button {
height:auto;
width: auto;
margin-left:10px;
margin-right:10px;
padding-left:10px;
padding-right:10px;
}
.tp_header a {
font-size:10px;
margin:5px;
font-style:italic;
}

  `;

  document.head.appendChild(tradeStyles);
}
addGlobalStyles();


function addGlobalSettings() {
  const tpHeader = document.querySelector('main h1').textContent

  if (tpHeader === 'The Mystery Island Trading Post') {
    const navBar = document.querySelector('main nav');
    navBar.innerHTML += `| <a href="#settings" id="tpSettings">Trading Post Settings</a>`

    var tpSettings = document.getElementById('tpSettings');
      tpSettings.addEventListener('click', function () {
      var tradeDetails = document.querySelector('.trading_post');
        if (tradeDetails.style.display != 'none') {
            openTradeSettings();}
  })}
}
addGlobalSettings();

function addGlobalHeader() {
    const mainTP = document.querySelector('.trading_post');
    let mainHeader = document.createElement('div');
    mainHeader.classList.add('tp_header');
    mainTP.parentNode.insertBefore(mainHeader, mainTP);

    let headerButton = document.createElement('button');
    headerButton.id = 'createHeader';
    headerButton.textContent = 'Create a new trade!';

    let linkLots = document.createElement('a');
    let user = document.querySelector("#userinfo > a:nth-child(2)").text;
    linkLots.href = `https://www.grundos.cafe/island/tradingpost/lot/user/${user}/`;
    linkLots.textContent = 'Link to your Lots';

    let clipboardIcon = document.createElement('span');
    clipboardIcon.classList.add('clipboard-icon');
    clipboardIcon.textContent = '📋';
    clipboardIcon.style.cursor = 'pointer';
    clipboardIcon.title = 'Copy Link to Clipboard';


    mainHeader.append(headerButton);
    mainHeader.append(linkLots);
      mainHeader.append(clipboardIcon);


    document.getElementById('createHeader').addEventListener('click', function() {
        window.location.href = '/island/tradingpost/createtrade/';
    });

    clipboardIcon.addEventListener('click', function() {
        const tempInput = document.createElement('input');
        tempInput.value = linkLots.href;
        document.body.appendChild(tempInput);

        tempInput.select();
        document.execCommand('copy');

        document.body.removeChild(tempInput);

        clipboardIcon.textContent = '✓ Copied!';
        setTimeout(function() {
            clipboardIcon.textContent = '📋';
        }, 1500);
    });
}
addGlobalHeader();


function openTradeSettings() {
const tradeDetails = document.querySelector('.trading_post'),
      tradeSettings = Object.assign(document.createElement('div'), {
          id: 'tradeSettings',
          className: 'trading_post bg-dm-gray flex-column margin-auto',
          style: { display: 'none' },
          innerHTML: `<div class="header"><strong>Trading Post Script Settings</strong></div><div></div>`
      }),
      wishContainer = Object.assign(document.createElement('div'), {
          id: 'wishContainer',
          innerHTML: `<p><strong>Default Wishlists</strong></p>`
      }),
      hiddenContainer = Object.assign(document.createElement('div'), {
          id: 'hiddenContainer',
          innerHTML: `<p><strong>Trade-Blocked Users</strong></p>`
      }),
      exitSettingsBtn = Object.assign(document.createElement('button'), {
          id: 'exitSettings',
          textContent: "Save and Exit Settings"
      });

tradeDetails.insertAdjacentElement('afterend', tradeSettings);
tradeSettings.append(wishContainer, hiddenContainer, exitSettingsBtn);




exitSettingsBtn.addEventListener('click', function() {
  tradeSettings.remove();
  tradeDetails.style.display = "";
})

}


async function initiateNewTrade() {
  const inventItems = document.querySelectorAll('.trade-item');
  const itemDetails = await getItemDetails(inventItems);

  let checkedCount = 0;
  const counterDisplay = createCounterDisplay(checkedCount);
  const itemButtons = document.querySelector('#tp-buttons');
  const filterInput = createFilterInput();
  const autoSelect = createSelectButtons();
  const createBtn = document.querySelector('.center input.form-control');
  createBtn.value = "Submit and View Trades";
  const submitBtn = createSubmitButton();
  const wishList = document.querySelector('#wishlist');
  wishlist.placeholder = "WISHLIST: Optionally, list what you are seeking."
  const slotsData = document.querySelector('.flex-column.med-gap > span');
  const [slotsOpen, slotsAvail] = slotsData.textContent.match(/\d+/g).map(Number);

  const quickSale = document.querySelector('#quicksale-neopoints');


  const container = document.createElement('div');
  container.id = "newContainer";

  document.querySelector('#tp-buttons').insertAdjacentElement('afterend', container);
    container.append(filterInput);
    container.append(counterDisplay);
    container.append(autoSelect);
  if (slotsOpen != 0) {
    quickSale.placeholder = "Name an auto sale price."
    container.append(slotsData);
    container.append(quickSale);}
    container.append(wishList);
    container.append(submitBtn);
    container.append(createBtn);
    document.querySelector('.med-gap').replaceWith(itemButtons)


  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', event => handleCheckboxChange(event, counterDisplay));
  });

  filterInput.addEventListener('input', () => filterShownItems(itemDetails, filterInput.value));
     filterInput.dispatchEvent(new Event('input'));

  filterInput.addEventListener('input', () => filterShownItems(itemDetails, filterInput.value));
  submitBtn.addEventListener('click', event => submitTradeForm(itemDetails));
}
function submitTradeForm(itemDetails){
  event.preventDefault();

  const tokenVal = document.querySelector('form [name="csrfmiddlewaretoken"]').value;
  const wishList = document.querySelector('textarea#wishlist').value;
  const checkedItems = Array.from(document.querySelectorAll('.trade-item input')).filter(item => item.checked);
  const quickSale = document.querySelector('input#quicksale-neopoints').value;

  var formData = new FormData();
  formData.append('csrfmiddlewaretoken', tokenVal);
  formData.append('quicksale-neopoints', quickSale)
  formData.append('wishlist', wishList);

  checkedItems.forEach(item => {
    formData.append('checks', item.value);
  });

    fetch('/island/tradingpost/processcreation/', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (response.redirected) {
      window.location.reload();
    } else {
      console.log('Form submitted successfully');
    }
  })
  .catch(error => {
    console.error('Error submitting form:', error);
  });
}

function createSubmitButton() {
const submitBtn = document.createElement('button');
submitBtn.id = "submitBtn";
submitBtn.textContent = "Submit and Create Next"

  return submitBtn;

}

async function getItemDetails(inventItems) {
  return Array.from(inventItems).map(item => {
    let itemName = item.querySelector('.item-info > span').textContent;
    let itemRarity = parseInt(item.querySelector('.item-info > span:nth-child(2)').textContent.replace(/\D/g, ''), 10) || 0;
    let itemID = item.querySelector('input').value;
    return { item, itemName, itemRarity, itemID };
  });
}

function createSelectButtons() {
  const selectFirst = document.createElement('button');
  const selectMax = document.createElement('button');
  const selectNone = document.createElement('button');
  const buttonCont = document.createElement('span');
  selectFirst.id = 'selectFirst';
  selectMax.id = 'selectMax';
  selectNone.id = 'selectNone';
  buttonCont.append(selectFirst, selectMax, selectNone);
  selectFirst.textContent = "Select First";
  selectMax.textContent = "Select 15";
  selectNone.textContent = "Clear All";

  selectFirst.addEventListener('click', (event) => {
    event.preventDefault();
    selectFirstAction();
  });
  selectMax.addEventListener('click', (event) => {
    event.preventDefault();
    selectMaxAction();
  });
  selectNone.addEventListener('click', (event) => {
    event.preventDefault();
    selectNoneAction();
  });

  return buttonCont;
}

function selectFirstAction() {
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
let index = 0;
checkboxes.forEach(checkbox => {
  let parent = checkbox.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    if (style.display === 'none') {
      return;
    }
    parent = parent.parentElement;
  }
  checkbox.checked = (index === 0);
  index++;
});

  updateCheckedCount();
}

function selectMaxAction() {
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
let selectedCount = 0;

checkboxes.forEach(checkbox => {
  if (selectedCount >= 15) {
    return;
  }
  let parent = checkbox.parentElement;
  let hidden = false;
  while (parent) {
    const style = window.getComputedStyle(parent);
    if (style.display === 'none') {
      hidden = true;
      break;
    }
    parent = parent.parentElement;
  }
  if (!hidden) {
    checkbox.checked = true;
    selectedCount++;
  }
});

  updateCheckedCount();
}

function selectNoneAction() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
  updateCheckedCount();
}

function updateCheckedCount() {
  const counterDisplay = document.getElementById('checkedCounter');
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
  counterDisplay.textContent = `Selected: ${checkedCount}`;
}

function createCounterDisplay(initialCount) {
  const counterDisplay = document.createElement('span');
  counterDisplay.id = 'checkedCounter';
  counterDisplay.textContent = `Selected: ${initialCount}`;
  return counterDisplay;
}

function createFilterInput() {
  const filterInput = document.createElement('input');
  filterInput.placeholder = "Filter by Name or Rarity";
  filterInput.id = "createFilter";
  filterInput.value = sessionStorage.getItem('filterValue') || '';
  return filterInput;
}

function filterShownItems(itemDetails) {
  let filterValue = document.querySelector('#createFilter').value;
  sessionStorage.setItem('filterValue', filterValue);
  const lowerCaseFilterValue = filterValue.toLowerCase();
  itemDetails.forEach(({ item, itemName, itemRarity }) => {
    item.style.display = itemName.toLowerCase().includes(lowerCaseFilterValue) || itemRarity.toString().includes(lowerCaseFilterValue) ? '' : 'none';
  });
}

function handleCheckboxChange(event, counterDisplay) {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  let checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;

  if (checkedCount > 15) {
    alert(`You can only select up to 15 items.`);
    event.target.checked = false;
    checkedCount--;
  }

  counterDisplay.textContent = `Selected: ${checkedCount}`;
}



async function capturelotDetails() {
  const tradeLots = document.querySelectorAll('.trade-lot');
  const lotCount = tradeLots.length;
  let tokenVal = document.querySelector('.button-group [type="hidden"][name="csrfmiddlewaretoken"]').value;
document.querySelectorAll('.flex-column [action="/island/tradingpost/createtrade/"], .trading_post .small-gap')
  .forEach(element => element.style.display = "none");


  let lotDetails = [];
  tradeLots.forEach(lot => {
    let lotNum = lot.querySelector('.button-group input[type="hidden"][name="lotno"]').value;
    let offerCt = parseInt(lot.querySelector('span').textContent.replace(/\D/g, ''), 10) || 0;
    let lotDate = new Date(lot.querySelector('span:nth-child(5)').textContent.split(':').slice(1).join(':').replace('NST', '').trim().replace(' at ', ` ${new Date().getFullYear()} `));
    let autoSale = parseInt(lot.querySelector(`span#quicksale-text-${lotNum}`).textContent.replace(/\D/g, ''), 10) || null;
console.log(lotDate)


    let entry = { lotNum: lotNum, offerCt: offerCt, element: lot , autoSale: autoSale, lotDate: lotDate};
    lotDetails.push(entry);
  });

  return { tokenVal, lotDetails, tradeLots };
}

function generateCancelButtons() {

const createLotBtn = document.querySelector('form.center [type="submit"]');
const cancelContainer = document.createElement('div');
const cancelAllBtn = document.createElement('button');

cancelContainer.id = "cancelContainer";
cancelAllBtn.classList = "cancelbtn";
cancelAllBtn.id = "cancelBtn";
cancelAllBtn.textContent = "Cancel ALL Trades";



  cancelAllBtn.onclick = function() {
    const confirmed = confirm('Are you sure you wish to cancel ALL trades at once? This may take a moment and will not include any trades with pending offers.');
    if (confirmed) {
    cancelAllBtn.disabled = true;
    cancelAllBtn.textContent = "Cancellation in progress...";
      cancelAllTrades();
    } else {
//Do Nothing
    }
};



createLotBtn.parentNode.insertAdjacentElement('afterend', cancelContainer);
cancelContainer.append(cancelAllBtn);
}

function generateSortElement() {
  const sortSelect = document.createElement('select');
  sortSelect.id = "sortSelect";

  var options = ['Sort by Newest', 'Sort by Oldest', 'Show Offers First', 'Show Offers Only', 'Show Autosale Only'];
  for (var i = 0; i < options.length; i++) {
    var option = document.createElement('option');

    option.value = [i + 1];
    option.text = options[i];
    sortSelect.appendChild(option);
  }

  var selectedOption = localStorage.getItem('selectedOption');
  if (selectedOption) {
    sortSelect.value = selectedOption;
  }
    applySelectedOption();


  document.querySelector('#cancelContainer').append(sortSelect);
  sortSelect.addEventListener('change', function () {
    applySelectedOption();
    localStorage.setItem('selectedOption', sortSelect.value);
  });
}

async function applySelectedOption() {
  const { tokenVal, lotDetails, tradeLots } = await capturelotDetails();
  const linehr = document.querySelectorAll('hr');
  linehr.forEach(line => {line.remove();})
  const sortSelect = document.getElementById('sortSelect');
  const selectedValue = parseInt(sortSelect.value);

  if (selectedValue === 1) { //newest
    lotDetails.sort((a, b) => b.lotDate - a.lotDate);
  } else if (selectedValue === 2) { //oldest
    lotDetails.sort((a, b) => a.lotDate - b.lotDate);
  } else if (selectedValue === 3) { //offers first
    lotDetails.sort((a, b) => b.offerCt - a.offerCt);
  } else if (selectedValue === 4) { //offers only
    lotDetails.forEach(lot => {
      lot.element.style.display = '';
      if (lot.offerCt === 0) {
        lot.element.style.display = 'none';
      } else {
        lot.element.style.display = 'visible';
      }
    });
  } else if (selectedValue === 5) { //autosale only
    lotDetails.forEach(lot => {
      lot.element.style.display = '';
      if (lot.autoSale === null) {
        lot.element.style.display = 'none';
      } else {
        lot.element.style.display = 'visible';
      }
    });  }

if (selectedValue !== 4 && selectedValue !== 5) {
    const parent = tradeLots[0].parentElement;
    lotDetails.forEach(lot => {
      parent.appendChild(lot.element);
      lot.element.style.display = ''; // Ensure all elements are displayed for sorting options 1 and 2
    });
  }
}

async function cancelAllTrades() {
// Submit the form to cancel all trades on the page.
  const { tokenVal, lotDetails, tradeLots } = await capturelotDetails();
    const cancelAllBtn = document.getElementById('cancelAllBtn');
  if (cancelAllBtn) {
    cancelAllBtn.disabled = true}


  function submitForm(lotNum) {
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = '/island/tradingpost/canceltrade/';

    var input1 = document.createElement('input');
    input1.type = 'hidden';
    input1.name = 'csrfmiddlewaretoken';
    input1.value = tokenVal;

    var input2 = document.createElement('input');
    input2.type = 'hidden';
    input2.name = 'lotno';
    input2.value = lotNum.lotNum;

    form.appendChild(input1);
    form.appendChild(input2);

    document.body.appendChild(form);
    form.submit();
  }

  lotDetails.forEach((lotNum, index) => {

    if (lotNum.offerCt === 0) {
    setTimeout(() => {
      submitForm(lotNum);
    }, index * 500);
    } else {

    }
  });
}