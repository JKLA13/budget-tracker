let db;
// setup indexDB
const request = indexedDB.open("budgetDB", 1);

request.onupgradeneeded = function (event) {
  let db = event.target.result;
  db.createBudgetStore("budgetDB", { autoIncrement: true });
};
// check if online
request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDB();
  }
};
// error, if offline
request.onerror = function (event) {
  db = event.target.result;

  if (navigator.onLine === false) {
    console.log("Error" + event.target.error);
  }
};
// create, access, and record to store with add method
function saveRecord(record) {
  const transaction = db.transaction(["budgetDB"], "readwrite");
  const store = transaction.objectStore("budgetDB");

  store.add(record);
}
// open transaction, access object store, and get all records from store
function checkDB() {
  const transaction = db.transaction(["budgetDB"], "readwrite");
  const store = transaction.objectStore("budgetDB");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["budgetDB"], "readwrite");
          const store = transaction.budgetStore("budgetDB");
          // if successful, clear all items in your store
          store.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDB);
