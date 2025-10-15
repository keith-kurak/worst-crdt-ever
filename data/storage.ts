import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import { sortBy, last, uniqBy } from "lodash";
import { uniqueNamesGenerator, starWars } from "unique-names-generator";
// @ts-ignore
import { nxt, recv } from "@tpp/hybrid-logical-clock";

// polyfill crypto on mobile (this also requires the patch on @tpp/simple-uuid)
if (Platform.OS !== "web") {
  // @ts-ignore
  window.crypto = Crypto;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTransactions() {
  return sortBy(await crdtToTransactions(), "timestamp").reverse();
}

export async function addTransaction(title: string, amount: string) {
  await addNewTransaction_crdt(title, amount);
}

export async function editTransaction(id: string, description: string, amount: string) {
  await editTransaction_crdt(id, { title: description, amount });
}

export async function deleteTransaction(id: string) {
  await deleteTransaction_crdt(id);
}

export async function syncWithServer() {
  const records = await getCrdtRecords();
  await delay(1000);
  const response = await fetch("/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(records),
  });
  let updatedRecords = [...await getCrdtRecords(), ...await response.json()];
  updatedRecords = uniqBy(updatedRecords, "recordId");
  const lastRecord = last(sortBy(updatedRecords, "timestamp"));
  if (lastRecord) {
    recv(lastRecord.timestamp);
  }
  await AsyncStorage.setItem(crdtDataset, JSON.stringify(updatedRecords));
}

// CRDT transactions
const crdtDataset = "crdt4";

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
  return Object.values(transactions);
}

let firstGetDone = false;

export async function getCrdtRecords() {
  const recordsJson = await AsyncStorage.getItem(crdtDataset);

  const records = recordsJson ? JSON.parse(recordsJson) : [];

  // sync HLC on first load
  if (!firstGetDone) {
    const lastRecord = last(sortBy(records, "timestamp"));
    if (lastRecord) {
      recv(lastRecord.timestamp);
    }

    firstGetDone = true;
  }

  return records;
}

async function addNewTransaction_crdt(title: string, amount: string) {
  const rowId = Crypto.randomUUID();
  const records: CrdtRecord[] = [
    await createCrdtRecord(rowId, "title", title),
    await createCrdtRecord(rowId, "amount", amount),
  ];
  await writeCrdtRecords(records);
}

async function editTransaction_crdt(rowId: string, updates: { [key: string]: string }) {
  const records: CrdtRecord[] = await Promise.all(
    Object.entries(updates).map(([column, value]) =>
      createCrdtRecord(rowId, column, value)
    )
  );
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
  const timestamp = nxt();
  return {
    recordId: Crypto.randomUUID(),
    clientName,
    rowId,
    column,
    value,
    tombstone,
    timestamp,
  };
}

async function writeCrdtRecords(records: CrdtRecord[]) {
  const currentRecords = await getCrdtRecords();
  const updatedRecords = [...currentRecords, ...records];
  await AsyncStorage.setItem(crdtDataset, JSON.stringify(updatedRecords));
}
