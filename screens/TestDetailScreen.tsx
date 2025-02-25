"use client";

import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { ArrowLeft } from "lucide-react-native";
import { getTests, Test } from "../api/tests/route";

type Question = {
    question: string;
    options: { text: string; score: number }[];
};

type Test = {
    documentId: string;
    title: string;
    description: { type: string; children: Array<{ text: string }> }[];
    questions: Question[];
};

export default function TestDetailScreen({ navigation, route }: TestScreenProps) {
    const [testDetail, setTestDetail] = useState<Test | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number | null }>({});
    const [totalScore, setTotalScore] = useState(0);

    const { testId } = route.params;


    const getInterpretation = (score: number): string => {
        if (score >= 0 && score <= 4) {
            return "No significant signs of depression.";
        } else if (score >= 5 && score <= 9) {
            return "Mild depression.";
        } else if (score >= 10 && score <= 14) {
            return "Moderate depression.";
        } else if (score >= 15 && score <= 19) {
            return "Moderately severe depression.";
        } else {
            return "Severe depression.";
        }
    };
    useEffect(() => {
        fetchTestDetail();
    }, [testId]);

    const fetchTestDetail = async () => {
        setIsLoading(true);
        try {
            const allTests: Test[] = await getTests();
            const selectedTest = allTests.find((test) => test.documentId === testId);
            console.log("Test récupéré :", JSON.stringify(selectedTest, null, 2)); // Ajout du log
            setTestDetail(selectedTest || null);
        } catch (error) {
            console.error("Erreur lors de la récupération du test :", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleAnswerSelection = (questionIndex: number, optionIndex: number): void => {
    setSelectedAnswers((prev) => {
        const updatedAnswers = { ...prev, [questionIndex]: optionIndex };

        let newTotalScore = 0;
        if (testDetail?.questions) {
            Object.keys(updatedAnswers).forEach((qIndex) => {
                const q = testDetail.questions[parseInt(qIndex)];
                const selectedOption = q.options[updatedAnswers[parseInt(qIndex)]];
                newTotalScore += selectedOption?.score || 0;
            });
        }
        console.log("Total Score:", newTotalScore);
        setTotalScore(newTotalScore);
        return updatedAnswers;
    });
};

    const getDescriptionText = (description: { type: string, children: Array<{ text: string }> }[]): string => {
        return description
            .map((paragraph) =>
                paragraph.children.map((child) => child.text).join(" ")
            )
            .join("\n");
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!testDetail) {
        return (
            <View style={styles.container}>
                <Text>No test details found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>{testDetail.title}</Text>
                {testDetail.description && (
                    <Text style={styles.description}>
                        {getDescriptionText(testDetail.description)}
                    </Text>
                )}
            </View>

            <View style={styles.questionsContainer}>
                <Text style={styles.questionsTitle}>Questions :</Text>
                {testDetail.questions.map((question, qIndex) => (
                    <View key={qIndex} style={styles.questionContainer}>
                        <Text style={styles.questionText}>{question.question}</Text>
                        <View style={styles.optionsContainer}>
                            {question.options.map((option, oIndex) => {
                                return (
                                    <TouchableOpacity
                                        key={oIndex}
                                        style={[
                                            styles.optionContainer,
                                            selectedAnswers[qIndex] === oIndex && styles.selectedOption,
                                        ]}
                                        onPress={() => handleAnswerSelection(qIndex, oIndex)}
                                    >
                                        <Text style={styles.optionText}>{option}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                    </View>
                ))}
                <View style={styles.resultContainer}>
                    <Text style={styles.scoreText}>Total Score: {totalScore}</Text>

                    <Text style={styles.interpretationText}>
                        {getInterpretation(totalScore)}
                    </Text>
                </View>

            </View>


        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 29,
        paddingVertical: 20,
    },
    header: {
        backgroundColor: "white",
        paddingVertical: 15,
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: "600",
        fontFamily: 'fantasy',
        color: "#2f4f4f",
        marginBottom: 20,
        textAlign: 'center',
        padding: 22,

    },
    description: {
        fontSize: 15,
        color: "#000",
        textAlign: "center",
        marginTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    backButton: {
        position: "absolute",
        top: 10,
        left: 5,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(170, 166, 166, 0.3)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
    questionsContainer: {
        padding: 20,
    },
    questionsTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    questionContainer: {
        marginBottom: 20,
    },
    questionText: {
        fontSize: 16,
        marginBottom: 10,
        fontWeight: "bold",
    },
    optionsContainer: {
        marginTop: 5,
    },
    optionContainer: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 25,
        marginVertical: 5,
        backgroundColor: "#fff",
    },
    optionText: {
        fontSize: 14,
        color: "#000",
        textAlign: "center",
        fontWeight: "bold",

    },
    selectedOption: {
        backgroundColor: "#2f4f4f",
        borderColor: "#2f4f4f",
    },
    resultContainer: {
        marginTop: 20,
        padding: 20,
        backgroundColor: "#f4f4f4",
        borderRadius: 40,
    },
    scoreText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    interpretationText: {
        marginTop: 10,
        fontSize: 14,
        color: "#5559",
    },
});
