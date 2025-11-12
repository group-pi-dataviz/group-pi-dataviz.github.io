// This file contains the definitions of constants such as colors and data sources
// used in the data visualizations.

export const COLORS = {
    
    // Brand colors
    brandBlue: '#002677',
    brandYellow: '#F4DA40',
    brandRed: '#C8102E',
    brandCyan: '#199BFC',
    brandBlack: '#25282A',
    brandGray: '#D9D9D6',
    dibris: '#007C58',

    // Utility colors
    // in the addThumbnail Function:
    // #bbbbbb 
    // 'white'
    
    // Waffle chart colors
    //  'lightgray',
    // #ff4d4d
    // Tooltip...
};

export const DATA_SOURCES = {
    waffleDataSrc: "macro_event_type_counts.csv",
    groupedDataSrc: "event_fatalities.csv",
    stackedDataPercSrc: "event_types_percentages.csv",
    stackedDataCountsSrc: "event_types_counts.csv",
    heatmapAfghanistanSrc: "afghanistan_yearly_events_by_event_type.csv",
    heatmapMyanmarSrc: "myanmar_yearly_events_by_event_type.csv",
    heatmapPhilippinesSrc: "philippines_yearly_events_by_event_type.csv",
    barDataSrc: "bar_data.csv",
    histogramEventsDataSrc: "afgh_events_by_month.csv",
    histogramFatalitiesDataSrc: "afgh_fatalities_by_month.csv",
    boxDataSrc: "af_battles.csv",
    ridgeDataSrc: 'wfp_food_prices_afg_wide_usd_small.csv'
    // Add other data sources here as needed
};

export const BOLD_COUNTRIES = new Set([
  'Afghanistan', 
  'Philippines', 
  'Myanmar'
]);

