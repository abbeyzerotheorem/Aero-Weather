import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    Keyboard
} from 'react-native';
// use local timer-based debounce instead of external package
import { searchCities } from '../services/locationService';

const AutocompleteInput = ({ 
    value, 
    onChangeText, 
    onSelectCity,
    placeholder,
    style 
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);

    // Timer-based debounce to avoid relying on external package methods
    const searchTimer = useRef(null);

    useEffect(() => {
        if (value && value.length >= 2) {
            setLoading(true);
            if (searchTimer.current) clearTimeout(searchTimer.current);
            searchTimer.current = setTimeout(async () => {
                try {
                    const results = await searchCities(value);
                    setSuggestions(results || []);
                    setShowSuggestions((results || []).length > 0);
                } catch (e) {
                    console.error('Search error', e);
                    setSuggestions([]);
                    setShowSuggestions(false);
                } finally {
                    setLoading(false);
                }
            }, 500);
        } else {
            if (searchTimer.current) {
                clearTimeout(searchTimer.current);
                searchTimer.current = null;
            }
            setSuggestions([]);
            setShowSuggestions(false);
            setLoading(false);
        }

        return () => {
            if (searchTimer.current) {
                clearTimeout(searchTimer.current);
                searchTimer.current = null;
            }
        };
    }, [value]);

    const handleSelectCity = (city) => {
        setShowSuggestions(false);
        setSuggestions([]);
        Keyboard.dismiss();
        onSelectCity(city.fullName);
        onChangeText(city.fullName);
    };

    const handleFocus = () => {
        if (suggestions.length > 0 && value.length >= 2) {
            setShowSuggestions(true);
        }
    };

    const renderSuggestion = ({ item }) => (
        <TouchableOpacity 
            style={styles.suggestionItem}
            onPress={() => handleSelectCity(item)}
        >
            <View style={styles.suggestionContent}>
                <Text style={styles.cityIcon}>📍</Text>
                <View style={styles.suggestionTextContainer}>
                    <Text style={styles.cityName}>{item.name}</Text>
                    <Text style={styles.cityDetails}>
                        {item.state ? `${item.state}, ` : ''}{item.country}
                    </Text>
                </View>
                <Text style={styles.chevron}>→</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, style]}>
            <View style={styles.inputContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder={placeholder || "Search for a city..."}
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    returnKeyType="search"
                    autoCapitalize="words"
                />
                {loading && (
                    <ActivityIndicator size="small" color="#007AFF" style={styles.loader} />
                )}
            </View>
            
            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item, index) => `${item.name}-${item.country}-${index}`}
                        renderItem={renderSuggestion}
                        keyboardShouldPersistTaps="handled"
                        maxToRenderPerBatch={10}
                        initialNumToRender={5}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 1000,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 15,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 10,
        color: '#999',
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: '#333',
    },
    loader: {
        marginLeft: 10,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 55,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        maxHeight: 300,
        zIndex: 1001,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    suggestionItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    suggestionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cityIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    suggestionTextContainer: {
        flex: 1,
    },
    cityName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    cityDetails: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    chevron: {
        fontSize: 16,
        color: '#ccc',
    },
});

export default AutocompleteInput;