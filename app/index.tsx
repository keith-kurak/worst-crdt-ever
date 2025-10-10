import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import { Colors } from "@/constants/Colors";
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  syncWithServer,
} from "@/data/storage";
import { LoadingShade } from "@/components/LoadingShade";

export default function Index() {
  const [transactions, setTransactions] = useState<any>([]);
  const [newTransactionTitle, setNewTransactionTitle] = useState("");
  const [newTransactionAmount, setNewTransactionAmount] = useState("");
  const [syncing, setSyncing] = useState(false);

  const myAddTransaction = async () => {
    if (newTransactionTitle && newTransactionAmount) {
      await addTransaction(newTransactionTitle, newTransactionAmount);
      setTransactions(await getTransactions());
      setNewTransactionTitle("");
      setNewTransactionAmount("");
    }
  };

  const myDeleteTransaction = async (id: any) => {
    await deleteTransaction(id);
    setTransactions(await getTransactions());
  };

  const mySync = async () => {
    setSyncing(true);
    await syncWithServer();
    setTransactions(await getTransactions());
    setSyncing(false);
  };

  useEffect(() => {
    getTransactions().then(setTransactions);
    setTimeout(() => {
      mySync();
    }, 500);
  }, []);

  // scary auto-sync code!

  useEffect(() => {
    const interval = setInterval(() => {
      mySync();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Total spent: ${formatAmount(
            transactions.reduce(
              (total: any, t: any) => total + parseFloat(t.amount),
              0
            )
          )}`,
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: Platform.OS === "web" ? 10 : undefined }}
              onPress={mySync}
            >
              {syncing ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={{ fontSize: 16, color: Colors.light.tint }}>
                  Sync
                </Text>
              )}
            </TouchableOpacity>
          ),
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
        <TouchableOpacity style={styles.button} disabled={false} onPress={myAddTransaction}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.rowId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => myDeleteTransaction(item.rowId)} disabled={false}>
            <View style={styles.transactionItem}>
              <View>
                <Text style={styles.description}>{item.title}</Text>
                <Text style={styles.date}>
                  {new Date(
                    parseInt(item.timestamp.split(":")[0])
                  ).toLocaleString() + ` - ${item.clientName}`}
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

const formatAmount = (amount: string) => {
  return (
    "$" +
    parseFloat(amount)
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, "$&,")
  );
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
