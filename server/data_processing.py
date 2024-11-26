from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

column_names = ["ID", "Ones", "Twos", "Threes", "Fours", "Fives", "Sixes", "Total", "Bonus", "3 of a Kind", "4 of a Kind", "Full House", "Small Straight", "Large Straight", "Chance", "Yahtzee", "Score"]
scaler_name = "scaler.pkl"
nan_value = -100

def add_headers(df):
    """Add headers to a DataFrame that lacks it."""
    df.columns = column_names
    return df

def trim_id(df):
    """Remove the ID from a DataFrame."""
    df = df.loc[:, df.columns != "ID"]
    return df

def split_xy(df):
    """Split a DataFrame into inputs/outputs."""
    X = df.loc[:, df.columns != "Score"]
    y = df["Score"]
    return [X, y]

def split_train_test(X, y, test_size):
    """Split input/output DataFrames into train/test sets"""
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, shuffle=False)
    return [X_train, X_test, y_train, y_test]
    
def scale_data(df, overwrite):
    """Scale the DataFrame, storing the scaler if we aren't using an existing one."""
    scaled_df = None
    if (overwrite == True):
        scaler = StandardScaler()
        scaled_df = scaler.fit_transform(df)
        joblib.dump(scaler, scaler_name)
        
    else:
        scaler = joblib.load(scaler_name)
        scaled_df = scaler.transform(df)
        
    return scaled_df

def mask_data(df):
    """Add 'mask' columns to a DataFrame that indicate whether NaNs exist."""
    for column in df.columns:
        df[f'{column} Mask'] = df[column].isna().astype(float)
    return df

def impute_nans(df):
    """Replace NaN values in a DataFrame with a specific (standard) value."""
    df = df.fillna(nan_value)
    return df