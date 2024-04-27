import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { sortBy } from 'lodash';

const key = 'transactions3';

export async function getTransactions() {
  return (sortBy(await crdtToTransactions(), 'timestamp')).reverse();
}

export async function addTransaction(title: string, amount: string) {
  await addNewTransaction_crdt(title, amount);
}

export async function deleteTransaction(id: string) {
  await deleteTransaction_crdt(id);
}

export async function syncWithServer() {
  const records = await getCrdtRecords();
  const response = await fetch('/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(records),
  });
  const updatedRecords = await response.json();
  console.log(updatedRecords)
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
};

async function crdtToTransactions() {
  const records = sortBy(await getCrdtRecords(), 'timestamp');
  const transactions: any = {};
  records.forEach((record : CrdtRecord) => {
    if (record.tombstone) {
      delete transactions[record.rowId];
    } else {
      transactions[record.rowId] = {
        ...transactions[record.rowId],
        rowId: record.rowId,
        [record.column]: record.value,
        timestamp: record.timestamp, // keep latest timestamp
      };
    }
  });
  console.log(records);
  return Object.values(transactions);
}

async function getCrdtRecords() {
  const records = await AsyncStorage.getItem(crdtDataset);
  return records ? JSON.parse(records) : [];
}

async function addNewTransaction_crdt(title: string, amount: string) {
  const rowId = Crypto.randomUUID();
  const records: CrdtRecord[] = [
    createCrdtRecord(rowId, "title", title),
    createCrdtRecord(rowId, "amount", amount),
  ];
  await writeCrdtRecords(records);
}

async function deleteTransaction_crdt(rowId: string) {
  await writeCrdtRecords([createCrdtRecord(rowId, "", "", true)]);
}

function createCrdtRecord(rowId: string, column: string, value: string, tombstone?: boolean) {
  return {
    recordId: Crypto.randomUUID(),
    rowId,
    column,
    value,
    tombstone,
    timestamp: new Date().getTime().toString(),
  };
}

async function writeCrdtRecords(records: CrdtRecord[]) {
  const currentRecords = await getCrdtRecords();
  const updatedRecords = [ ...currentRecords, ...records];
  await AsyncStorage.setItem(crdtDataset, JSON.stringify(updatedRecords));
}

