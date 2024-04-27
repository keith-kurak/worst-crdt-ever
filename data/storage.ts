import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const key = 'transactions3';

export async function getTransactions() {
  const transactions = await AsyncStorage.getItem(key);
  return transactions ? JSON.parse(transactions) : [];
}

export async function addTransaction(title: string, amount: string) {
  const transactions = await getTransactions();
  const transaction = {
    id: Crypto.randomUUID(),
    title,
    amount: parseFloat(amount),
    date: new Date().getTime(),
  };
  const updatedTransactions = [transaction, ...transactions];
  await AsyncStorage.setItem(key, JSON.stringify(updatedTransactions));
  return updatedTransactions;
}

export async function deleteTransaction(id: string) {
  const transactions = await getTransactions();
  const updatedTransactions = transactions.filter((t: any) => t.id !== id);
  await AsyncStorage.setItem(key, JSON.stringify(updatedTransactions));
  return updatedTransactions;
}