import pandas as pd

df = pd.read_csv('csvjson.csv')

print(df.shape)

df = df.drop(df[df.Average_Grade < 5].index)

print(df.shape)
df.to_csv('csvjson.csv') 