import pandas as pd

# Load the CSV files with the correct delimiter
avg_df = pd.read_csv("MD_24_avgtemp.csv", sep=',', comment='#', usecols=['Date', 'Value'])
min_df = pd.read_csv("MD_24_mintemp.csv", sep=',', comment='#', usecols=['Date', 'Value'])
max_df = pd.read_csv("MD_24_maxtemp.csv", sep=',', comment='#', usecols=['Date', 'Value'])

# Rename the 'Value' column in each file to distinguish them
avg_df.rename(columns={"Value": "Avg_Temperature"}, inplace=True)
min_df.rename(columns={"Value": "Min_Temperature"}, inplace=True)
max_df.rename(columns={"Value": "Max_Temperature"}, inplace=True)

# Merge the three DataFrames on the 'Date' column
merged_df = avg_df.merge(min_df[['Date', 'Min_Temperature']], on="Date", how="inner")
merged_df = merged_df.merge(max_df[['Date', 'Max_Temperature']], on="Date", how="inner")

# Save the merged DataFrame to a new file
merged_df.to_csv("merged_temperatures_no_anomalies.csv", index=False)

print("Merged file saved as 'merged_temperatures_no_anomalies.csv'")
