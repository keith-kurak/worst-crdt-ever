import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { sortBy } from "lodash";
import { uniqueNamesGenerator, starWars } from "unique-names-generator";

const key = "transactions3";

export async function getTransactions() {
  return sortBy(await crdtToTransactions(), "timestamp").reverse();
}

export async function addTransaction(title: string, amount: string) {
  await addNewTransaction_crdt(title, amount);
}

export async function deleteTransaction(id: string) {
  await deleteTransaction_crdt(id);
}

export async function syncWithServer() {
  const records = await getCrdtRecords();
  const response = await fetch("/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(records),
  });
  const updatedRecords = await response.json();
  console.log(updatedRecords);
  await AsyncStorage.setItem(crdtDataset, JSON.stringify(updatedRecords));
}

// CRDT transactions
const crdtDataset = "crdt3";

type CrdtRecord = {
  recordId: string;
  rowId: string;
  column: string;
  value: string;
  tombstone?: boolean;
  timestamp: string;
  clientName: string;
};

async function getUniqueClientName() {
  const maybeUniqueClientName = await AsyncStorage.getItem("uniqueClientName");
  let uniqueClientName = maybeUniqueClientName
    ? JSON.parse(maybeUniqueClientName)
    : null;
  if (!uniqueClientName) {
    uniqueClientName = uniqueNamesGenerator({
      dictionaries: [starWars],
    });
    await AsyncStorage.setItem(
      "uniqueClientName",
      JSON.stringify(uniqueClientName)
    );
  }
  return uniqueClientName;
}

async function crdtToTransactions() {
  const records = sortBy(await getCrdtRecords(), "timestamp");
  const transactions: any = {};
  records.forEach((record: CrdtRecord) => {
    if (record.tombstone) {
      delete transactions[record.rowId];
    } else {
      transactions[record.rowId] = {
        ...transactions[record.rowId],
        rowId: record.rowId,
        [record.column]: record.value,
        timestamp: record.timestamp, // keep latest timestamp
        clientName: record.clientName,
      };
    }
  });
  console.log(records);
  return Object.values(transactions);
}

export async function getCrdtRecords() {
  const records = await AsyncStorage.getItem(crdtDataset);
  return records ? JSON.parse(records) : [];
}

async function addNewTransaction_crdt(title: string, amount: string) {
  const rowId = Crypto.randomUUID();
  const records: CrdtRecord[] = [
    await createCrdtRecord(rowId, "title", title),
    await createCrdtRecord(rowId, "amount", amount),
  ];
  await writeCrdtRecords(records);
}

async function deleteTransaction_crdt(rowId: string) {
  await writeCrdtRecords([await createCrdtRecord(rowId, "", "", true)]);
}

async function createCrdtRecord(
  rowId: string,
  column: string,
  value: string,
  tombstone?: boolean
) {
  const clientName = await getUniqueClientName();
  return {
    recordId: Crypto.randomUUID(),
    clientName,
    rowId,
    column,
    value,
    tombstone,
    timestamp: new Date().getTime().toString(),
  };
}

async function writeCrdtRecords(records: CrdtRecord[]) {
  const currentRecords = await getCrdtRecords();
  const updatedRecords = [...currentRecords, ...records];
  await AsyncStorage.setItem(crdtDataset, JSON.stringify(updatedRecords));
}
