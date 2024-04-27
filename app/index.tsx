import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Stack } from "expo-router";
import { Colors } from "@/constants/Colors";

const defaultTransactions = [
  { id: 1, title: "Groceries", amount: 100, date: new Date() },
  { id: 2, title: "Gas", amount: 50, date: new Date() },
  { id: 3, title: "Dinner", amount: 75, date: new Date() },
  { id: 4, title: "Car Wash", amount: 25, date: new Date() },
  {
    id: 5,
    title: "Apple Developer Subscription",
    amount: 99,
    date: new Date(),
  },
];

export default function Index() {
  const [transactions, setTransactions] = useState(defaultTransactions);
  const [newTransactionTitle, setNewTransactionTitle] = useState("");
  const [newTransactionAmount, setNewTransactionAmount] = useState("");

  const addTransaction = () => {
    if (newTransactionTitle && newTransactionAmount) {
      const id = transactions.length + 1;
      setTransactions([
        {
          id,
          title: newTransactionTitle,
          amount: parseFloat(newTransactionAmount),
          date: new Date(),
        },
        ...transactions,
      ]);
      setNewTransactionTitle("");
      setNewTransactionAmount("");
    }
  };

  const deleteTransaction = (id: any) => {
    const updatedTransactions = transactions.filter(
      (transaction) => transaction.id !== id
    );
    setTransactions(updatedTransactions);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Total spent: ${formatAmount(
            transactions.reduce((total, t) => total + t.amount, 0)
          )}`,
        }}
      />
      <View style={styles.header}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={newTransactionTitle}
          onChangeText={setNewTransactionTitle}
          placeholder="Description"
        />
        <TextInput
          style={styles.input}
          value={newTransactionAmount}
          onChangeText={setNewTransactionAmount}
          placeholder="Amount"
        />
        <TouchableOpacity style={styles.button} onPress={addTransaction}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => deleteTransaction(item.id)}>
            <View style={styles.transactionItem}>
              <View>
                <Text style={styles.description}>{item.title}</Text>
                <Text style={styles.date}>
                  {item.date.toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const formatAmount = (amount: number) => {
  return "$" + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  button: {
    paddingHorizontal: 10,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    height: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    padding: 5,
    marginRight: 10,
    fontSize: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    minWidth: 65,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  description: {
    fontSize: 20,
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 75,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
