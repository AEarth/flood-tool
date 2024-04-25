- When adding a widget to a view or window make sure the views name or window name starts with "Flood:
- link from public map to expert map must be set as top window
- keep in mind  when changing the search geocoding service you must also update the flood tool data source 
- you must set the zoom in the map
TODO - Add more configuration info here

AK TODO - 
    completed - add lag/hag/wse to structure info panel
    completed - fix HUC8 endpoint (legacy shapefile source causing advanced querying error)
    completed - add keyValuePair display type (e.g. Flood Zone: X (Area of Minimal Flooding))
    completed - add displaySection "float" format to round image services to 0.1 decimal
    completed - style structure info panel (lag/hag/wse)
    completed - add displaySection.sectionLabelHelpPage pagelink option to config
    pending - add address / parcel info

DEPLOY TODO -
    While {`/experience/4/page/${displaySection.sectionLabelHelpPage}`} works to test in local dev
            use ?page= for deployement app routing