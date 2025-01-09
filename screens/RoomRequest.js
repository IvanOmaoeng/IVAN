import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useRoute } from '@react-navigation/native';

const firebaseConfig = {
    apiKey: "AIzaSyA6RfaxbGGgkl6WY3EFx4k3VYVNW4RXW6Y",
    authDomain: "class-s-database.firebaseapp.com",
    databaseURL: "https://class-s-database-default-rtdb.firebaseio.com",
    projectId: "class-s-database",
    storageBucket: "class-s-database.appspot.com",
    messagingSenderId: "222242197245",
    appId: "1:222242197245:web:26f4b4d9b45c4b271a3894",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const RoomRequestScreen = () => {
    const [requests, setRequests] = useState([]);
    const [uid, setUid] = useState('');
    const [instructorId, setInstructorId] = useState('');
    const route = useRoute();

    useEffect(() => {
        // Get the current user's UID
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUid(currentUser.uid);
        }

        // Get the Instructor ID from navigation params
        if (route.params && route.params.instructorId) {
            setInstructorId(route.params.instructorId);
        }

        // Fetch room requests from the database
        const requestsRef = ref(database, 'Room_Requests');
        const unsubscribe = onValue(requestsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const requestsArray = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));
                setRequests(requestsArray);
            }
        });

        return () => unsubscribe();
    }, [route.params]);

    const handleAction = async (requestId, newStatus) => {
        try {
            const requestRef = ref(database, `Room_Requests/${requestId}`);
            await update(requestRef, {
                status: newStatus
            });
            alert(`Request ${newStatus.toLowerCase()} successfully!`);
        } catch (error) {
            console.error('Error updating request:', error);
            alert('Failed to update request status');
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const renderRequestItem = ({ item }) => (
        <View style={styles.requestCard}>
            <Image 
                source={{ uri: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.instructor || 'User') }} 
                style={styles.profileImage} 
            />
            <View style={styles.requestDetails}>
                <Text style={styles.nameText}>{item.instructor || 'Unknown'}</Text>
                <Text style={styles.idText}>Instructor ID: {item.yourInstructorId || 'N/A'}</Text>
                <Text style={styles.timeText}>
                    Requested: {formatTime(item.requestDate)}
                </Text>
                <Text style={styles.scheduleText}>
                    Schedule: {item.time || 'Not specified'}
                </Text>
            </View>
            {item.status === 'Pending' && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={styles.acceptButton}
                        onPress={() => handleAction(item.id, 'Accepted')}
                    >
                        <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.rejectButton}
                        onPress={() => handleAction(item.id, 'Rejected')}
                    >
                        <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}
            {item.status !== 'Pending' && (
                <View style={[
                    styles.statusBadge,
                    item.status === 'Accepted' ? styles.acceptedBadge : styles.rejectedBadge
                ]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>NOTIFICATION</Text>
            {instructorId !== '' && <Text style={styles.instructorIdText}>Instructor ID: {instructorId}</Text>}
            {uid !== '' && <Text style={styles.uidText}>User ID: {uid}</Text>}
            {requests.length === 0 ? (
                <Text style={styles.emptyText}>No requests found</Text>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRequestItem}
                    contentContainerStyle={styles.listContainer}
                />
                
            )}
        </View>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#49873E',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        padding: 20,
        top: 50,
        paddingBottom: 10,
        textAlign: 'center',
    },
    uidText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    listContainer: {
        padding: 15,
        top:90,
    },
    requestCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    requestDetails: {
        flex: 1,
    },
    nameText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 2,
    },
    idText: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 2,
    },
    timeText: {
        fontSize: 12,
        color: '#95a5a6',
    },
    scheduleText: {
        fontSize: 12,
        color: '#95a5a6',
        marginTop: 2,
    },
    actionButtons: {
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 8,
    },
    acceptButton: {
        backgroundColor: '#27ae60',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        minWidth: 80,
    },
    rejectButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        minWidth: 80,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        minWidth: 80,
    },
    acceptedBadge: {
        backgroundColor: '#27ae60',
    },
    rejectedBadge: {
        backgroundColor: '#e74c3c',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#fff',
        marginTop: 20,
    },
    instructorIdText: {
        fontSize: 100,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
        marginTop: 10,
    },
});

export default RoomRequestScreen;
