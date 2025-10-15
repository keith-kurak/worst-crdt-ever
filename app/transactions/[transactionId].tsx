import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  deleteTransaction,
  editTransaction,
  getTransactions,
} from "@/data/storage";
import { LoadingShade } from "@/components/LoadingShade";

type Transaction = {
  rowId: string;
  title: string;
  amount: string;
  timestamp: string;
  clientName: string;
};

export default function TransactionEditor() {
  const { transactionId } = useLocalSearchParams<{ transactionId?: string }>();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTransaction() {
      if (typeof transactionId !== "string") {
        setTransaction(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const transactions = (await getTransactions()) as Transaction[];
        const found =
          transactions.find((item) => item.rowId === transactionId) ?? null;

        if (!cancelled) {
          setTransaction(found);
          setDescription(found?.title ?? "");
          setAmount(found?.amount ?? "");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTransaction();

    return () => {
      cancelled = true;
    };
  }, [transactionId]);

  const handleSave = async () => {
    if (typeof transactionId !== "string" || saving) {
      return;
    }

    setSaving(true);

    try {
      await editTransaction(transactionId, description.trim(), amount.trim());
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (typeof transactionId !== "string" || saving) {
      return;
    }

    Alert.alert(
      "Delete transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setSaving(true);
            try {
              await deleteTransaction(transactionId);
              router.back();
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const isValid = description.trim().length > 0 && amount.trim().length > 0;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: transaction?.title ?? "Transaction" }}
      />
      <LoadingShade isLoading={loading || saving} />
      {loading ? (
        <Text style={styles.helper}>Loading transaction...</Text>
      ) : !transaction ? (
        <Text style={styles.helper}>Transaction not found.</Text>
      ) : (
        <>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            editable={!saving}
          />
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Amount"
            editable={!saving}
          />
          <View style={styles.buttonRow}>
            <Button
              title="Save"
              onPress={handleSave}
              disabled={!isValid || saving}
            />
            <Button
              title="Delete"
              color="red"
              onPress={handleDelete}
              disabled={saving}
            />
          </View>
          <Text style={styles.meta}>
            Last updated by {transaction.clientName}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  label: {
    marginTop: 16,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 24,
    justifyContent: "space-between",
  },
  helper: {
    marginTop: 32,
    fontSize: 16,
    color: "#666",
  },
  meta: {
    marginTop: 16,
    fontSize: 12,
    color: "#666",
  },
});
