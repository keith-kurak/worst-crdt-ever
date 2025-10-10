import React, { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { Stack } from "expo-router";
import { getCrdtRecords } from "@/data/storage";
import { sortBy } from 'lodash';

export default function Index() {
  const [records, setRecords] = useState<any>([]);

  useEffect(() => {
    getCrdtRecords().then((records) => setRecords(sortBy(records, 'timestamp').reverse()));
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: `Debug`,
        }}
      />
      <FlatList
        data={records}
        keyExtractor={(item) => item.recordId.toString()}
        renderItem={({ item }) => (
          <View style={{ margin: 10 }}>
            {Object.keys(item).map((key, index) => (
              <View key={index.toString()} style={{ flexDirection: "row" }}>
                <Text style={{ fontWeight: "bold", width: 100 }}>{key}</Text>
                <Text>{item[key]}</Text>
              </View>
            ))}
          </View>
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: "black" }} />
        )}
      />
    </View>
  );
}
