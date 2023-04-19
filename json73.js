'use strict';
// Bankist App 
// bankist.netlify.app

console.log('---------------------------------------------------------------------------------------------Bankist App----------------------------------------');

// Data
const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        "2019-11-18T21:31:17.178Z",
        "2019-12-23T07:42:02.383Z",
        "2020-01-28T09:15:04.904Z",
        "2023-01-22T10:17:24.185Z",
        "2020-05-08T14:11:59.604Z",
        "2023-01-27T17:01:17.194Z",
        "2020-07-28T23:36:17.929Z",
        "2023-01-26T10:51:36.790Z",
      ],
      currency: "EUR",
      locale: "pt-PT", // de-DE
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        "2019-11-01T13:15:33.035Z",
        "2019-11-30T09:48:16.867Z",
        "2019-12-25T06:04:23.907Z",
        "2020-01-25T14:18:46.235Z",
        "2020-02-05T16:33:06.386Z",
        "2020-04-10T14:43:26.374Z",
        "2020-06-25T18:49:59.371Z",
        "2020-07-26T12:01:20.894Z",
      ],
      currency: "USD",
      locale: "en-US",
};

const account3 = {
    owner: 'Steven Thomas Williams',
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7,
    pin: 3333,
};

const account4 = {
    owner: 'Sarah Smith',
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1,
    pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////////////////////////////
// Functions 

const formatMovementDate = function(date, locale) {
    const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

    const daysPassed = calcDaysPassed(new Date, date);
    // console.log(daysPassed);

    if(daysPassed === 0) return 'Today';
    if(daysPassed === 1) return 'Yesterday';
    if(daysPassed <= 7) return `${daysPassed} days ago`;
    // else{
        // const day = `${date.getDate()}`.padStart(2, 0);
        // const month = `${date.getMonth() + 1}`.padStart(2, 0);
        // const year = date.getFullYear();
        // return `${day}/${month}/${year}`;
    // }
    return new Intl.DateTimeFormat(locale).format(date);
};

// returns the currency string updated by the Intl API
const formatCur = function(value, locale, currency) {
    return new Intl.NumberFormat(locale, {
        style : 'currency',
        currency : currency,
    }).format(value);
};

// add the transaction amount to the history section of the Bankist app
const displayMovements = function (acc, sort = false) {
    containerMovements.innerHTML = '';

    const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

    movs.forEach(function (mov, i) {
        const type = mov > 0 ? 'deposit' : 'withdrawal';

        const date = new Date(acc.movementsDates[i]);
        const displayDate = formatMovementDate(date, acc.locale);

        const formattedMov = formatCur(mov, acc.locale, acc.currency);

                const html = `
            <div class="movements__row">
                <div class="movements__type movements__type--${type}">${i + 1} ${type} </div>
                <div class="movements__date">${displayDate}</div>
                <div class="movements__value">${formattedMov}</div>
            </div>`;
        containerMovements.insertAdjacentHTML('afterbegin', html);
    });
}

// calculate the balance and then display
const calcDisplayBalance = function (acc) {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
    labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
    const incomes = acc.movements
        .filter(mov => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);
    // labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

    const out = acc.movements
        .filter(mov => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

    const interest = acc.movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * acc.interestRate / 100))
        .filter((int, i, arr) => {
            console.log(arr);
            return int >= 1;
        })
        .reduce((acc, mov) => acc + mov, 0);
    labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
}

// generate the login id of every user
const user = 'Steven Thomas William'; // stw
const createUsernames = function (accs) {
    accs.forEach(function (acc) {
        acc.username = acc.owner.toLocaleLowerCase().split(' ').map(name => name[0]).join('');
    });
};

createUsernames(accounts);

const updateUI = function (acc) {
    // Display movements 
    displayMovements(acc, false);

    // Display balance
    calcDisplayBalance(acc);

    // Display summary
    calcDisplaySummary(acc);
    // console.log('hello');
}

const startLogOutTimer = function() {
    const tick = function() {
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const sec = String(time % 60).padStart(2, 0);
        // In each call, print the remaining time to call to UI
        labelTimer.textContent = `${min}:${sec}`;

        // When 0 seconds, stop timer and logout user
        if(time === 0) {
            clearInterval(timer);
            labelWelcome.textContent = `Login to get started`;
            containerApp.style.opacity = 0;
        }

        // Decrease 1sec
        time--;
    };

    // Set time to 5 minutes
    let time = 120;

    // Call the timer every second
    tick();
    const timer = setInterval(tick, 1000);
    return timer;
};

// Event handler
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN 
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;
// labelWelcome.textContent = `Welcome ${currentAccount.owner.split(' ')[0]
//             }`;
// Experimenting API

// for login button
btnLogin.addEventListener('click', function (e) {
    // prevent form from submitting
    e.preventDefault();
    console.log('LOGIN');
    // when we click the button flash happen, this is because the form submitts the value 
    // another great thing is that whenever we are in the input field and hit the button the click event got clicked;
    currentAccount = accounts.find(
        acc => acc.username === inputLoginUsername.value
    );
    console.log(currentAccount);

    // if(currentAccont && currentAccount.pin === Number(inputLoginPin)) {
    if (currentAccount?.pin === +(inputLoginPin.value)) {
        // Display UI and message
        labelWelcome.textContent = `Welcome ${currentAccount.owner.split(' ')[0]
            }`;
        containerApp.style.opacity = 100;

        // Create current date and time

        // const now = new Date();
        // const day = `${now.getDate()}`.padStart(2, 0);
        // const month = `${now.getMonth() + 1}`.padStart(2, 0);
        // const year = now.getFullYear();
        // const hour = `${now.getHours()}`.padStart(2, 0);
        // const min = `${now.getMinutes()}`.padStart(2, 0);
        // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

        // with the help of padStart and padEnd we can able to set padding of a characters 
        // padStart(targetLength)
        // padStart(targetLength, padString)

        const now = new Date();
        const options = {
            hour : 'numeric',
            minute : 'numeric',
            day : 'numeric',
            // month : 'numeric',
            // month : '2-digit',
            month : 'numeric',
            year : 'numeric',
            // weekday : 'long'
        };
        // const locale = navigator.language;
        // console.log(locale);
        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

        // day/ month/ year
        // console.log('LOGIN');
        // console.log(currentAccount.pin);

        // Clear input fields
        inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur();
        
        // Timer
        if(timer) clearInterval(timer);

        // StartLogoutTimer
        timer = startLogOutTimer();
        
        // Update UI
        updateUI(currentAccount);
    }
});

// for loan granting
btnTransfer.addEventListener('click', function (e) {
    e.preventDefault();
    const amount = +(inputTransferAmount.value);
    // console.log(amount);
    const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);
    console.log(amount, receiverAcc);
    inputTransferAmount.value = inputTransferTo.value = '';

    if (amount > 0 &&
        receiverAcc &&
        currentAccount.balance >= amount &&
        receiverAcc?.username !== currentAccount.username
    ) {
        // Doing the transfer
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);

        // Add Transfer date
        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAcc.movementsDates.push(new Date().toISOString());

        // Update UI
        updateUI(currentAccount);

        // Reset Timer
        clearInterval(timer);
        timer = startLogOutTimer();
    }
});

btnLoan.addEventListener('click', function (e) {
    e.preventDefault();

    const amount = Math.floor(inputLoanAmount.value);
    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
        setTimeout(function() {
            // Add movement
            currentAccount.movements.push(amount);

            // Add Loan Date
            currentAccount.movementsDates.push(new Date().toISOString());

            // Update UI
            updateUI(currentAccount);

            // Reset Timer
            clearInterval(timer);
            timer = startLogOutTimer();
        }, 2500);
    }
    inputLoanAmount.value = '';
})


// for deleting account
btnClose.addEventListener('click', function (e) {
    console.log('hi');
    e.preventDefault();
    if (
        inputCloseUsername.value === currentAccount.username &&
        +(inputClosePin.value) === currentAccount.pin
    ) {
        const index = accounts.findIndex(
            acc => acc.username === currentAccount.username
        );
        console.log(index);

        // Delete account
        accounts.splice(index, 1);

        // .indexOf(23)
        // we can only search a value whereas in the findIndex we can apply the complex operation
        // console.log(receiverAcc);

        // Hide UI
        containerApp.style.opacity = 0;
    }
    // Clear Input Field
    inputCloseUsername.value = inputClosePin.value = '';
});

// const accountMovements = accounts.map(acc => acc.movements);
// console.log(accountMovements);
// const allMovements = accountMovements.flat();
// console.log(allMovements);
// const overallBalance = allMovements.reduce((acc, mov) => acc + mov,0);
// console.log(overallBalance);

// const overallBalance = accounts
//         .map(acc => acc.movements)
//         .flat()
//         .reduce((acc, mov) => acc + mov,0);
// console.log(overallBalance);

// using the map first and flatening the result is a common thing;
// so, we use flatmap

let sorted = false;

const overallBalance = accounts
    .flatMap(acc => acc.movements)
    .reduce((acc, mov) => acc + mov, 0);
// console.log(overallBalance);

btnSort.addEventListener('click', function (e) {
    e.preventDefault();
    // if (!sorted){
    //     displayMovements(currentAccount, true);
    //     sorted = true;
    // }
    // else{
    //     displayMovements(currentAccount, false);
    //     sorted = false;
    // }
    displayMovements(currentAccount, !sorted);
    sorted = !sorted;
});

// console.log('----------------');
labelBalance.addEventListener('click', function () {
    const movementsUI = Array.from(
        document
        .querySelectorAll(
            '.movements_value'), 
            el => +(el.textContent.replace('€', ''))
    );
    // console.log(movementsUI);
    const movementsUI2 = [
        ...document.querySelectorAll('.movements_value')
    ];
    // console.log(movementsUI2);
});

// Remainder code from Number lecture
// labelBalance.addEventListener('click', function() {
//     console.log('hello');
//     [...document.querySelectorAll('.movements__row')].
//     forEach(function(row , i){
//         if (i % 2 === 0) row.style.backgroundColor = 'orangered';
//         if (i % 3 === 0) row.style.backgroundColor = 'blue';
//     });
// });


// Intl API to format numbers in javascript
// const num = 38884764.23;
// const options = {
//     // style : "unit",
//     // style : "percent",
//     style : "currency",
//     unit : 'celsius',
//     currency : 'EUR',
//     // useGrouping : false,
// };
// console.log('US        :',new Intl.NumberFormat('en-US', options).format(num));
// console.log('Germany   :',new Intl.NumberFormat('de-DE', options).format(num));
// console.log('Syria     :',new Intl.NumberFormat('ar-SY', options).format(num));
// console.log(navigator.language + '     :',new Intl.NumberFormat(navigator.language, options).format(num));
