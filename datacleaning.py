




import pandas as pd

# Step 1: Load the data
file_path = 'cleaned_data.csv'  # Update this to your CSV file path
df = pd.read_csv(file_path)

# Step 2: Inspect the data
print(df.head())
print(df.info())
print(df.isnull().sum())

# Step 3: Convert all text in the DataFrame to lowercase
df = df.apply(lambda col: col.map(lambda s: s.lower() if type(s) == str else s))
print(df)

# # Step 4: Handle Missing Values
# # Drop rows where any of the Emission columns have missing values
# Emission_columns = ['Emission_including_land-use_change', 'Emission_from_land-use_change', 'Annual_Emission']
# df.dropna(subset=Emission_columns, inplace=True)

# #delete rows with negative values in Emission columns
# df = df[(df['Emission_including_land-use_change'] >= 0) & (df['Emission_from_land-use_change'] >= 0) & (df['Annual_Emission'] >= 0)]


df['Country'] = df['Country'].str.lower().str.strip()

# Step 6: Remove Specific Entities
# Remove rows where 'Country' contains specific substrings
df = df[~df['Country'].str.contains(r'asia|world|europe|africa|income|north america', regex=True)]

# Step 7: Aggregate Data if Necessary
# Group by 'Country' and 'Year', taking the mean of Emission
df = df.groupby(['Country', 'Year'], as_index=False).agg({
    'Emission': 'mean'
})

# Step 8: Remove Duplicates
df.drop_duplicates(inplace=True)

# Step 9: Map Continents

continent_mapping = {
    'afghanistan': 'Asia',
    'albania': 'Europe',
    'algeria': 'Africa',
    'andorra': 'Europe',
    'angola': 'Africa',
    'anguilla': 'North America',
    'antigua and barbuda': 'North America',
    'argentina': 'South America',
    'armenia': 'Asia',
    'aruba': 'North America',
    'australia': 'Australia',
    'austria': 'Europe',
    'azerbaijan': 'Asia',
    'bahamas': 'North America',
    'bahrain': 'Asia',
    'bangladesh': 'Asia',
    'barbados': 'North America',
    'belarus': 'Europe',
    'belgium': 'Europe',
    'belize': 'North America',
    'benin': 'Africa',
    'bermuda': 'North America',
    'bhutan': 'Asia',
    'bolivia': 'South America',
    'bonaire sint eustatius and saba': 'North America',
    'bosnia and herzegovina': 'Europe',
    'botswana': 'Africa',
    'brazil': 'South America',
    'british virgin islands': 'North America',
    'brunei': 'Asia',
    'bulgaria': 'Europe',
    'burkina faso': 'Africa',
    'burundi': 'Africa',
    'cambodia': 'Asia',
    'cameroon': 'Africa',
    'canada': 'North America',
    'cape verde': 'Africa',
    'chad': 'Africa',
    'chile': 'South America',
    'china': 'Asia',
    'colombia': 'South America',
    'comoros': 'Africa',
    'congo': 'Africa',
    'cook islands': 'Oceania',
    'costa rica': 'North America',
    "cote d'ivoire": 'Africa',
    'croatia': 'Europe',
    'cuba': 'North America',
    'curacao': 'North America',
    'cyprus': 'Asia',
    'czechia': 'Europe',
    'democratic republic of congo': 'Africa',
    'denmark': 'Europe',
    'djibouti': 'Africa',
    'dominica': 'North America',
    'dominican republic': 'North America',
    'east timor': 'Asia',
    'ecuador': 'South America',
    'egypt': 'Africa',
    'el salvador': 'North America',
    'equatorial guinea': 'Africa',
    'eritrea': 'Africa',
    'estonia': 'Europe',
    'eswatini': 'Africa',
    'ethiopia': 'Africa',
    'faroe islands': 'Europe',
    'fiji': 'Oceania',
    'finland': 'Europe',
    'france': 'Europe',
    'french polynesia': 'Oceania',
    'gabon': 'Africa',
    'gambia': 'Africa',
    'georgia': 'Asia',
    'germany': 'Europe',
    'ghana': 'Africa',
    'greece': 'Europe',
    'greenland': 'North America',
    'grenada': 'North America',
    'guatemala': 'North America',
    'guinea': 'Africa',
    'guinea-bissau': 'Africa',
    'guyana': 'South America',
    'haiti': 'North America',
    'honduras': 'North America',
    'hong kong': 'Asia',
    'hungary': 'Europe',
    'iceland': 'Europe',
    'india': 'Asia',
    'indonesia': 'Asia',
    'iran': 'Asia',
    'iraq': 'Asia',
    'ireland': 'Europe',
    'israel': 'Asia',
    'italy': 'Europe',
    'jamaica': 'North America',
    'japan': 'Asia',
    'jordan': 'Asia',
    'kazakhstan': 'Asia',
    'kenya': 'Africa',
    'kiribati': 'Oceania',
    'kosovo': 'Europe',
    'kuwait': 'Asia',
    'kyrgyzstan': 'Asia',
    'laos': 'Asia',
    'latvia': 'Europe',
    'lebanon': 'Asia',
    'lesotho': 'Africa',
    'liberia': 'Africa',
    'libya': 'Africa',
    'liechtenstein': 'Europe',
    'lithuania': 'Europe',
    'luxembourg': 'Europe',
    'macao': 'Asia',
    'madagascar': 'Africa',
    'malawi': 'Africa',
    'malaysia': 'Asia',
    'maldives': 'Asia',
    'mali': 'Africa',
    'malta': 'Europe',
    'marshall islands': 'Oceania',
    'mauritania': 'Africa',
    'mauritius': 'Africa',
    'mexico': 'North America',
    'micronesia (country)': 'Oceania',
    'moldova': 'Europe',
    'mongolia': 'Asia',
    'montenegro': 'Europe',
    'montserrat': 'North America',
    'morocco': 'Africa',
    'mozambique': 'Africa',
    'myanmar': 'Asia',
    'namibia': 'Africa',
    'nauru': 'Oceania',
    'nepal': 'Asia',
    'netherlands': 'Europe',
    'new caledonia': 'Oceania',
    'new zealand': 'Oceania',
    'nicaragua': 'North America',
    'niger': 'Africa',
    'nigeria': 'Africa',
    'niue': 'Oceania',
    'north korea': 'Asia',
    'north macedonia': 'Europe',
    'norway': 'Europe',
    'oceania': 'Oceania',
    'oman': 'Asia',
    'pakistan': 'Asia',
    'palau': 'Oceania',
    'palestine': 'Asia',
    'panama': 'North America',
    'papua new guinea': 'Oceania',
    'paraguay': 'South America',
    'peru': 'South America',
    'philippines': 'Asia',
    'poland': 'Europe',
    'portugal': 'Europe',
    'qatar': 'Asia',
    'romania': 'Europe',
    'russia': 'Asia',
    'rwanda': 'Africa',
    'saint helena': 'Africa',
    'saint kitts and nevis': 'North America',
    'saint lucia': 'North America',
    'saint pierre and miquelon': 'North America',
    'saint vincent and the grenadines': 'North America',
    'samoa': 'Oceania',
    'sao tome and principe': 'Africa',
    'saudi arabia': 'Asia',
    'senegal': 'Africa',
    'serbia': 'Europe',
    'seychelles': 'Africa',
    'sierra leone': 'Africa',
    'singapore': 'Asia',
    'sint maarten (dutch part)': 'North America',
    'slovakia': 'Europe',
    'slovenia': 'Europe',
    'solomon islands': 'Oceania',
    'somalia': 'Africa',
    'south america': 'South America',
    'south korea': 'Asia',
    'south sudan': 'Africa',
    'spain': 'Europe',
    'sri lanka': 'Asia',
    'sudan': 'Africa',
    'suriname': 'South America',
    'sweden': 'Europe',
    'switzerland': 'Europe',
    'syria': 'Asia',
    'taiwan': 'Asia',
    'tajikistan': 'Asia',
    'tanzania': 'Africa',
    'thailand': 'Asia',
    'togo': 'Africa',
    'tonga': 'Oceania',
    'trinidad and tobago': 'North America',
    'tunisia': 'Africa',
    'turkey': 'Asia',
    'turkmenistan': 'Asia',
    'turks and caicos islands': 'North America',
    'tuvalu': 'Oceania',
    'uganda': 'Africa',
    'ukraine': 'Europe',
    'united arab emirates': 'Asia',
    'united kingdom': 'Europe',
    'united states': 'North America',
    'uruguay': 'South America',
    'uzbekistan': 'Asia',
    'vanuatu': 'Oceania',
    'venezuela': 'South America',
    'vietnam': 'Asia',
    'wallis and futuna': 'Oceania',
    'yemen': 'Asia',
    'zambia': 'Africa',
    'zimbabwe': 'Africa'
}

df['Region'] = df['Country'].map(continent_mapping)

# Handle missing values in the 'continent' column
df['Region'].fillna('Unknown', inplace=True)

# Filter by the top ten countries with high emission
df = df[(df['Year'] >= 2017) & (df['Year'] <= 2024)]

# Filter by the top ten countries with high emission
top_ten_countries = df.groupby('Country')['Emission'].sum().nlargest(10).index
df = df[df['Country'].isin(top_ten_countries)]


# Step 10: Export Clean Data
cleaned_file_path = 'cleaned_data.csv'  # Specify the path for the cleaned data
df.to_csv(cleaned_file_path, index=False)

print("Data cleaning complete. Cleaned data saved to:", cleaned_file_path)
