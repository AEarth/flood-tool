/** @jsx jsx */
import Color from 'color'
import { React, css, jsx, IconResult, classNames, polished , hooks} from 'jimu-core'
import { Button, Icon, ButtonProps, ButtonSize, Tooltip } from 'jimu-ui'
import { DisplaySection, RiskCard } from '../../config'
import { type JimuMapView, loadArcGISJSAPIModules, type JimuMapViewGroup } from 'jimu-arcgis'

import { FloodWidgetContext } from '../widget-context'

import Map from  "esri/Map"
import SceneView from "esri/views/SceneView"
import GraphicsLayer from "esri/layers/GraphicsLayer"
import Graphic from "esri/Graphic"
import SimpleRenderer from "esri/renderers/SimpleRenderer"
import PointSymbol3D from "esri/symbols/PointSymbol3D"
import WebStyleSymbol from "esri/symbols/WebStyleSymbol"
import ObjectSymbol3DLayer from "esri/symbols/ObjectSymbol3DLayer"
import Slider from "esri/widgets/Slider"
import ValuePicker from "esri/widgets/ValuePicker"
import ValuePickerCombobox from "esri/widgets/ValuePicker/ValuePickerCombobox"
import ComboBoxInput from "esri/form/elements/inputs/ComboBoxInput"


import { get3dStyle } from '../style'
import { useContext } from 'react'

export const LABEL_HEIGHT = 21
export type AvatarSize = ButtonSize


const getColor = (floodType: 'high' | 'medium' | 'low' | 'none'): string => {
  switch (floodType) {
    case 'high':
      return 'red'
    case 'medium':
      return 'orange'
    case 'low':
      return 'green'
    case 'none':
      return 'yellow'
    default:
      return 'gray'
  }
}



export interface Flood3dProps extends React.HTMLAttributes<HTMLDivElement> {
  waterElevation: number
}

const useStyle = () => {
  return React.useMemo(() => {
    const width = length
    return css`
      width:100%;
      height: 100%;
      .flood-3d, #viewDiv {
        height:600px;
        width:100%;
      }
    `
  }, [])
}

export const Flood3d = React.forwardRef((props: Flood3dProps, ref: React.RefObject<HTMLDivElement>) => {
  const {
    waterElevation
  } = props

  const { theme } = useContext(FloodWidgetContext)
  
  // API constructors
   // API constructors
/*
   Map, SceneView, GraphicsLayer, Graphic, SimpleRenderer, PointSymbol3D, WebStyleSymbol, ObjectSymbol3DLayer, Slider, ValuePicker, ValuePickerCombobox, ComboBoxInput

   const Map = React.useRef<__esri.Map>(null)
   const SceneView = React.useRef<__esri.SceneView>(null)
   
   const GraphicsLayer = React.useRef<__esri.GraphicsLayer>(null) //__esri.Slice
   const Graphic = React.useRef<__esri.Graphic>(null) //__esri.SliceViewModel
   const SlicePlaneRef = React.useRef<__esri.SlicePlane>(null)
   const SliceAnalysisRef = React.useRef<__esri.SliceAnalysis>(null)
*/
  // States
  //const [jimuMapViewsState, setJimuMapViewsState] = React.useState<{ [id: string]: JimuMapView }>(null)
  const [apiLoadedState, setApiLoadedState] = React.useState<boolean>(false)


  // save btns
// 
React.useEffect(() => {
    if (!apiLoadedState) {
        loadArcGISJSAPIModules([
        "esri/Map",
        "esri/views/SceneView",
        "esri/layers/GraphicsLayer",
        "esri/Graphic",      
        "esri/renderers/SimpleRenderer",
        "esri/symbols/PointSymbol3D",
        "esri/symbols/WebStyleSymbol",
        "esri/symbols/ObjectSymbol3DLayer",
        "esri/widgets/Slider",
        "esri/widgets/ValuePicker",
        "esri/widgets/ValuePicker/ValuePickerCombobox",
        "esri/form/elements/inputs/ComboBoxInput",

    
        ]).then(modules => {
            //[Map, SceneView, GraphicsLayer, Graphic, SimpleRenderer, PointSymbol3D, WebStyleSymbol, ObjectSymbol3DLayer, Slider, ValuePicker, ValuePickerCombobox, ComboBoxInput] =        modules}).then(modules => {
            console.log( modules)
            setApiLoadedState(true)

        console.log("loaded")
      })
    }
    }, [apiLoadedState, setApiLoadedState])

    const cssStyle = useStyle()


    


    const picnicTableSymbol = new WebStyleSymbol({
      name: "Picnic_Table",
      styleName: "EsriRealisticStreetSceneStyle"
    });

    const trashStyleSymbol = new WebStyleSymbol({
      name: "Trash_Can_1",
      styleName: "EsriRealisticStreetSceneStyle"
    });

    const carFordTaurusSymbol = new WebStyleSymbol({
      name: "Ford_Taurus",
      styleName: "EsriRealisticTransportationStyle"
    });

    const carFordFusionSymbol = new WebStyleSymbol({
      name: "Ford_Fusion",
      styleName: "EsriRealisticTransportationStyle"
    });

    const simpleWaterSymbol = {
      type: "simple-fill",
      color: [71, 71, 107, 0.6],
      outline: {
        color: [71, 71, 107],
        width: 1
      }
    };

    const waterSymbol = {
      type: "polygon-3d",
      symbolLayers: [{
        type: "water",
        waveDirection: 180,
        color: "#716f4f",
        waveStrength: "moderate",
        waterbodySize: "medium"
      }]
    };

    /*
    "Small House" (https://skfb.ly/op9UL) by jimbogies is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
    */
    const whiteHouseSymbol = {
        type: "point-3d",  // autocasts as new PointSymbol3D()
        symbolLayers: [{
            type: "object",  // autocasts as new ObjectSymbol3DLayer()
            //width: 50,    // diameter of the object from east to west in meters
            height: 6,  // height of object in meters
            //depth: 15,   // diameter of the object from north to south in meters
            resource: { href: "https://consappsrpt.dcr.virginia.gov/DCR_models/small_house_3kb.glb" }
        }]
    };

    const bizBldgSymbol = {
        type: "point-3d",  // autocasts as new PointSymbol3D()
        symbolLayers: [{
            type: "object",  // autocasts as new ObjectSymbol3DLayer()
            height: 6,  // height of object in met3ers
            resource: { href: "https://consappsrpt.dcr.virginia.gov/DCR_models/generic_business_building_small.glb" }
        }]
    };

    const brickBldgSymbol = {
        type: "point-3d",  // autocasts as new PointSymbol3D()
        symbolLayers: [{
            type: "object",  // autocasts as new ObjectSymbol3DLayer()
            height: 6,  // height of object in meters
            resource: { href: "https://consappsrpt.dcr.virginia.gov/DCR_models/brick_home.glb" }
        }]
    };

    const cityBldgSymbol = {
        type: "point-3d",  // autocasts as new PointSymbol3D()
        symbolLayers: [{
            type: "object",  // autocasts as new ObjectSymbol3DLayer()
            height: 7.5,  // height of object in meters
            resource: { href: "https://consappsrpt.dcr.virginia.gov/DCR_models/downtown_city_building_04.glb" }
        }]
    };

    // https://developers.arcgis.com/javascript/latest/api-reference/esri-Map.html#basemap
    const map = new Map({
      // ground: "world-elevation",
      //basemap: "topo-vector" // "topo-vector" //"osm"
      basemap: "topo-vector" // "topo-vector" //"osm"
    });

    
    const waterSlider = new ValuePicker({
      layout: "vertical", // can also be horizontal
      component: {                                                // autocasts ValuePickerSlider when type is "slider".
        type: "slider",
        min: 0,                                                   // Start value
        max: 20,                                                 // End value
        //steps: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],      // Thumb snapping locations
        minorTicks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],      // Short tick lines
        majorTicks: [0, 5, 10, 15, 20], // Long tick lines
        labels: [0, 5, 10, 15, 20],                         // Long ticks with text
        labelFormatFunction: (value) => `${value} Feet`               // Label definition
      },
      values: [waterElevation]                                                // "current value"
    });

    const view = new SceneView({
      container: "viewDiv",
      map: map,
      // viewingMode: "local",
      // clippingEnabled: true,
      // // Use the exent defined in clippingArea to define the bounds of the scene
      // //  x: -0.178,
      // //  y: 51.488,
      // clippingArea: {
      //   xmax: -0.17,
      //   xmin: -0.19,
      //   ymax: 51.48,
      //   ymin: 51.5,
      //   spatialReference: {
      //     wkid: 4326
      //   }
      // },

      camera: {
        // autocasts as new Camera()
        position: [
          -0.17832950,
          51.48774404,
          11.68056
        ],
        heading: 41.26,
        tilt: 71.97
      }
    });

    

    view.on("pointer-up", (event) => {

          const p = view.camera.position;

          if (p.spatialReference.isWebMercator || p.spatialReference.isWGS84) {
            console.log(`
              {
                position: [
                  ${p.longitude.toFixed(8)},
                  ${p.latitude.toFixed(8)},
                  ${p.z.toFixed(5)}
                ],
                heading: ${view.camera.heading.toFixed(2)},
                tilt: ${view.camera.tilt.toFixed(2)}
              }`);
          }
          else {
            console.log(`
              {
                position: {
                  x: ${p.x.toFixed(5)},
                  y: ${p.y.toFixed(5)},
                  z: ${p.z.toFixed(3)},
                  spatialReference: ${p.spatialReference.wkid}
                },
                heading: ${view.camera.heading.toFixed(2)},
                tilt: ${view.camera.tilt.toFixed(2)}
              }`);
      }

      console.log(JSON.stringify(view.extent));
    });

    /*********************
     * Add graphics layer
     *********************/
    const graphicsLayer = new GraphicsLayer();
    

    /*************************
     * Add a 3D point graphics
     *************************/
    // TODO: this is currently London.
    const bldgPoint = {
      type: "point",
      x: -0.178,
      y: 51.488,
      z: 0
    };

    const bldgPointGraphic = new Graphic({
      geometry: bldgPoint
        });

    bldgPointGraphic.symbol = whiteHouseSymbol

    graphicsLayer.add(bldgPointGraphic);

    const carPoint = {
      type: "point",
      x: -0.178,
      y: 51.487865,
      z: 0
    };

    // https://developers.arcgis.com/javascript/latest/visualization/symbols-color-ramps/esri-web-style-symbols-3d/
    const carPointGraphic = new Graphic({
      geometry: carPoint
      //symbol: carFordFusionSymbol // carFordTaurusSymbol
    });

    carPointGraphic.symbol = carFordFusionSymbol
    graphicsLayer.add(carPointGraphic);


    /***************************
     * Add a 3D polygon water graphic
     ***************************/

    const polygon = {
      type: "polygon", // autocasts as new Polygon()
      rings: [
        [-0.184, 51.48391, -1],
        [-0.184, 51.49091, -1],
        [-0.172, 51.49091, -1],
        [-0.172, 51.48391, -1],
        [-0.184, 51.48391, -1]
      ]
    };

    const polygonGraphic = new Graphic({
      geometry: polygon,
      symbol: waterSymbol
    });

    graphicsLayer.add(polygonGraphic);

    

    map.add(graphicsLayer);

    // const waterSlider = new Slider({
    //   // container: "water-slider",
    //   min: 0,
    //   max: 20,
    //   values: [0],
    //   steps: 1,
    //   snapOnClickEnabled: false,
    //   visibleElements: {
    //     labels: true,
    //     rangeLabels: true
    //   }
    // });
    view.ui.add(waterSlider, "bottom-right");
    waterSlider.watch("values", (values) => { updateWater(values); });
    // waterSlider.on(["thumb-change", "thumb-drag"], updateWater);

    const bldgPicker = new ValuePicker({
      component: new ValuePickerCombobox({
        placeholder: "Change Building",
        items: [
          { value: "white", label: "White 2-story house" },
          { value: "brick", label: "Brick house" },
          { value: "biz", label: "Business building" },
          { value: "city", label: "City building" }              ]
      }),
      values: ["white"],
    });

    view.ui.add(bldgPicker, "bottom-left");
    bldgPicker.watch("values", (values) => {
      console.log(`building: ${values[0]}`);
      
      switch (values[0]) {
        case "white":
          bldgPointGraphic.symbol = whiteHouseSymbol;
          break;
        case "biz":
          bldgPointGraphic.symbol = bizBldgSymbol;
          break;
        case "brick":
          bldgPointGraphic.symbol = brickBldgSymbol;
          break;
        case "city":
          bldgPointGraphic.symbol = cityBldgSymbol;
          break;
        default:
          console.log('default building not implemented');
      }
    });

  

  const updateWater = () => {
      let waterDepth = 0;
        
        // map units are meters but slider is feet
        waterDepth = (waterSlider.values[0] > 0 ? waterSlider.values[0] : -10)  * .3048;

        if (waterDepth < .5) {
          view.environment.weather = {
            type: "sunny",     // autocasts as new RainyWeather({ cloudCover: 0.7, precipitation: 0.3 })
            cloudCover: 0.2,
            precipitation: 0.0
          };
        } else {
          view.environment.weather = {
            type: "rainy",     // autocasts as new RainyWeather({ cloudCover: 0.7, precipitation: 0.3 })
            cloudCover: 1,
            precipitation: 0.7
          };
        }

        polygonGraphic.geometry = {
          type: "polygon", // autocasts as new Polygon()
          rings: [
            [-0.184, 51.48391, waterDepth],
            [-0.184, 51.49091, waterDepth],
            [-0.172, 51.49091, waterDepth],
            [-0.172, 51.48391, waterDepth],
            [-0.184, 51.48391, waterDepth]
          ]
        };
      };



      
    const waterPicker = new ValuePicker({
      component: new ValuePickerCombobox({
        placeholder: "Change Water Symbol",
        items: [
          { value: "real", label: "Realistic Water" },
          { value: "trans", label: "Transparent Water" }          ]
      }),
      values: ["real"],
    })

    view.ui.add(waterPicker, "bottom-left")

    waterPicker.watch("values", (values) => {
      console.log(`water type: ${values[0]}`);
      
      switch (values[0]) {
        case "trans":
          polygonGraphic.symbol = simpleWaterSymbol;
          break;
        case "real":
          polygonGraphic.symbol = waterSymbol;
          break;
        default:
          console.log('default water symbol not implemented');
      }
    })

    if(waterElevation > 0)  updateWater()

    return (
      
           <div css={cssStyle} className={'flood-3d'}>
            <div id="viewDiv"></div>
           </div>
        
    )
})
