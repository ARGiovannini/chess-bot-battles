from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:8081"}})


# Initial game state
board = [""] * 9
current_player = "X"

def check_winner():
    """Check if there is a winner."""
    winning_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
        [0, 4, 8], [2, 4, 6]              # Diagonals
    ]
    for combo in winning_combinations:
        if board[combo[0]] == board[combo[1]] == board[combo[2]] and board[combo[0]] != "":
            return board[combo[0]]
    return None

@app.route("/game", methods=["GET"])
def get_game_state():
    """Return the current game state."""
    winner = check_winner()
    game_over = winner is not None or all(cell != "" for cell in board)
    return jsonify({
        "board": board,
        "current_player": current_player,
        "winner": winner,
        "game_over": game_over
    })

@app.route("/move", methods=["POST"])
def make_move():
    """Make a move on the board."""
    global board, current_player
    data = request.json
    position = data.get("position")

    if position is None or position < 0 or position >= 9:
        return jsonify({"error": "Invalid position"}), 400
    if board[position] != "":
        return jsonify({"error": "Position already taken"}), 400

    board[position] = current_player
    winner = check_winner()
    if winner or all(cell != "" for cell in board):  # Check if the game is over
        return jsonify({
            "board": board,
            "current_player": current_player,
            "winner": winner,
            "game_over": True
        })

    # Switch players
    current_player = "O" if current_player == "X" else "X"
    return jsonify({
        "board": board,
        "current_player": current_player,
        "winner": None,
        "game_over": False
    })

@app.route("/reset", methods=["POST"])
def reset_game():
    """Reset the game to the initial state."""
    global board, current_player
    board = [""] * 9
    current_player = "X"
    return jsonify({
        "board": board,
        "current_player": current_player,
        "winner": None,
        "game_over": False
    })

if __name__ == "__main__":
    app.run(debug=True)
