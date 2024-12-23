import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Button, Alert } from "react-native";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000"; // Replace with your local IP if testing on a physical device

type BoardType = string[];

interface GameState {
  board: BoardType;
  current_player: string;
  winner: string | null;
  game_over: boolean;
}

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardType>(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState<string>("X");
  const [winner, setWinner] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Fetch the initial game state
  useEffect(() => {
    fetchGameState();
  }, []);

  const fetchGameState = async () => {
    try {
      const response = await axios.get<GameState>(`${API_URL}/game`);
      setBoard(response.data.board);
      setCurrentPlayer(response.data.current_player);
      setWinner(response.data.winner);
      setGameOver(response.data.game_over);
    } catch (error) {
      console.error("Error fetching game state:", error);
    }
  };

  const handleMove = async (index: number) => {
    if (board[index] !== "" || gameOver) {
      Alert.alert("Invalid Move", "This position is already taken or the game is over.");
      return;
    }

    try {
      const response = await axios.post<GameState>(`${API_URL}/move`, { position: index });
      setBoard(response.data.board);
      setCurrentPlayer(response.data.current_player);
      setWinner(response.data.winner);
      setGameOver(response.data.game_over);

      if (response.data.winner) {
        Alert.alert("Game Over", `Winner: ${response.data.winner}`);
      } else if (response.data.game_over) {
        Alert.alert("Game Over", "It's a draw!");
      }
    } catch (error) {
      console.error("Error making move:", error);
    }
  };

  const resetGame = async () => {
    try {
      const response = await axios.post<GameState>(`${API_URL}/reset`);
      setBoard(response.data.board);
      setCurrentPlayer(response.data.current_player);
      setWinner(response.data.winner);
      setGameOver(response.data.game_over);
    } catch (error) {
      console.error("Error resetting game:", error);
    }
  };

  const renderCell = (index: number) => (
    <TouchableOpacity
      style={styles.cell}
      onPress={() => handleMove(index)}
      key={index}
    >
      <Text style={styles.cellText}>{board[index]}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tic Tac Toe</Text>
      {gameOver ? (
        <Text style={styles.subtitle}>
          {winner ? `Winner: ${winner}` : "It's a draw!"}
        </Text>
      ) : (
        <Text style={styles.subtitle}>Current Player: {currentPlayer}</Text>
      )}
      <View style={styles.board}>
        {board.map((_, index) => renderCell(index))}
      </View>
      <TouchableOpacity style={styles.resetGameButton} onPress={resetGame}>
        <Text style={styles.resetGameButtonText}>Reset Game</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  board: {
    width: 300,
    height: 300,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "33%",
    height: "33%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  cellText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  resetGameButton: {
    backgroundColor: "#4231b0",
    padding: 5,
  },
  resetGameButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default App;
