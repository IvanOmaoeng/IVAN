import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Button } from "react-native";
import { DataTable, Text } from "react-native-paper";
import { database } from "../firebaseConfig"; 
import { ref, get } from "firebase/database"; 
import { useNavigation } from "@react-navigation/native";

const InstructorLogs = () => {
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const userType = "instructor"; 

  const fetchLogs = async () => {
    setRefreshing(true);
    try {
      const snapshot = await get(ref(database, "RFID_Cards"));
      const data = snapshot.val();

      const logsArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setLogs(logsArray);
    } catch (error) {
      console.error("Error fetching logs: ", error);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Instructor Attendance Logs</Text>

      <ScrollView
        horizontal
        style={styles.horizontalScroll}
        contentContainerStyle={{ flexDirection: "row" }}
      >
        <ScrollView
          style={styles.tableContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchLogs} />}
        >
          <DataTable>
            <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title style={styles.column}>UID</DataTable.Title>
              <DataTable.Title style={styles.column}>Name</DataTable.Title>
              <DataTable.Title style={styles.column}>Institute</DataTable.Title>
              <DataTable.Title style={styles.column}>Building</DataTable.Title>
              <DataTable.Title style={styles.column}>Room</DataTable.Title>
              <DataTable.Title style={styles.column}>Time In</DataTable.Title>
              <DataTable.Title style={styles.column}>Time Out</DataTable.Title>
            </DataTable.Header>

            {logs.map((log, index) => (
              <DataTable.Row key={index} style={[styles.row, { backgroundColor: getRowColor(log.Institute) }]}>
                <DataTable.Cell style={styles.cell}>
                  <Text style={styles.cellText}>{log.UID}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.cell}>
                  <Text style={styles.cellText}>{log.Name}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.cell}>
                  <Text style={styles.cellText}>{log.Institute}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.cell}>
                  <Text style={styles.cellText}>{log.Building}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.cell}>
                  <Text style={styles.cellText}>{log.Room}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.cell}>
                  <Text style={styles.cellText}>{log.TimeIn}</Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.cell}>
                  <Text style={styles.cellText}>{log.TimeOut}</Text>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </ScrollView>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Back to Main Screen"
          onPress={() => navigation.navigate("MainScreen")}
        />
      </View>
    </View>
  );
};

const getRowColor = (institute) => {
  const instituteColors = {
    ICS: "#ffb347",
    ITE: "#57b9ff",
    IBE: "#ffed29",
  };
  return instituteColors[institute] || "#E0E0E0";
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#49873E",
    padding: 10,
    marginTop: 35,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#f0f4f8",
    textAlign: "center",
    marginVertical: 16,
    marginTop: 30,
  },
  horizontalScroll: {
    flex: 1,
    marginBottom: 20,
  },
  tableContainer: {
    flexGrow: 1,
  },
  tableHeader: {
    backgroundColor: "#C8E6C9",
    marginTop: 30,
  },
  row: {
    minWidth: "100%",
  },
  column: {
    minWidth: 120,
    justifyContent: "center",
  },
  cell: {
    minWidth: 120,
    justifyContent: "center",
  },
  cellText: {
    flexWrap: "wrap",
    textAlign: "center",
    fontWeight: "bold",
  },
  buttonContainer: {
    bottom: 50,
    alignSelf: "center",
    width: "50%",
    
  },
});

export default InstructorLogs;
