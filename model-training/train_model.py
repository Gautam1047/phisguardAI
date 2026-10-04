from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import pandas as pd
import os
from sklearn.model_selection import train_test_split


# Find the main project folder
project_folder = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

# Create the correct dataset path
dataset_path = os.path.join(
    project_folder,
    "dataset",
    "processed_urls.csv"
)

print("Loading dataset...")
print("Dataset path:", dataset_path)

# Load dataset
df = pd.read_csv(dataset_path)

print("Dataset loaded successfully!")
print("Dataset shape:", df.shape)


# Separate features and label
X = df.drop("label", axis=1)
y = df["label"]

print("\nFeatures (X):")
print("Shape:", X.shape)

print("\nLabels (y):")
print("Shape:", y.shape)


# Split into training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\n==============================")
print("Train-Test Split Completed")
print("==============================")

print("\nTraining data:")
print("X_train:", X_train.shape)
print("y_train:", y_train.shape)

print("\nTesting data:")
print("X_test:", X_test.shape)
print("y_test:", y_test.shape)
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score


# ==============================
# Create Random Forest model
# ==============================

print("\nCreating Random Forest model...")

model = RandomForestClassifier(
    n_estimators=50,
    max_depth=12,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)


# ==============================
# Train the model
# ==============================

print("Training model...")

model.fit(X_train, y_train)

print("Model training completed!")


# ==============================
# Make predictions
# ==============================

print("\nMaking predictions...")

y_pred = model.predict(X_test)


# ==============================
# Calculate accuracy
# ==============================

accuracy = accuracy_score(y_test, y_pred)

print("\n==============================")
print("Model Results")
print("==============================")

print("Accuracy:", accuracy)
print("Accuracy (%):", accuracy * 100)

print("\nClassification Report:")
print(classification_report(
    y_test,
    y_pred,
    target_names=["Legitimate", "Phishing"]
))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))
# ==============================
# Save trained model
# ==============================

model_path = os.path.join(
    project_folder,
    "model-training",
    "phishing_model.joblib"
)

joblib.dump(model, model_path)

print("\nModel saved successfully!")
print("Model path:", model_path)