/** @jsx jsx */
import {
  React,
  jsx,
  AllWidgetProps,
  lodash,
  loadArcGISJSAPIModule,
  DataSourceComponent,
  FeatureLayerQueryParams,
  DataSource,
  DataSourceStatus,
  WidgetState,
  ReactRedux,
  IMState,
} from "jimu-core";

import {
  Flood3dCard,
  Flood3dData,
  FloodData,
  IMConfig,
  RiskCard,
} from "../config";

import { JimuMapView, JimuMapViewComponent, zoomToUtils } from "jimu-arcgis";

import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import PictureMarkerSymbol from "esri/symbols/PictureMarkerSymbol";
import webMercatorUtils from "esri/geometry/support/webMercatorUtils";
import Point from "esri/geometry/Point";
import { getQueryParam, removeViewsParam } from "../utils/queryParam";
import { getStyle } from "./style";
import Query from "esri/rest/support/Query";

import Card3D from "./components/card-3d";
import { FloodWidgetContext } from "./widget-context";
import geometryEngine from "esri/geometry/geometryEngine";
import { Loading, hooks, Icon, Link } from "jimu-ui";
import { RiskCardComponent } from "./components/risk-card";
import FeatureSet from "esri/rest/support/FeatureSet";
import { ExternalViewComponent } from "./components/external-view";
import { FloodSectionFieldComponent } from "./components/flood-section-field";
import { useMemo } from "react";

const debugMode = false;

const { useState, useEffect, useRef } = React;

const Widget = (props: AllWidgetProps<IMConfig>): React.ReactElement => {
  const { config, useMapWidgetIds, theme, id } = props;

  const {
    restEndPoints,
    displaySections,
    show3dView,
    showAddress,
    showLatLong,
    showExternalMapLinks,
    useDataSources,
    coordinateDecimal,
  } = config;
  // state
  const [currentJimuMapView, setCurrentJimuMapView] = useState(null);
  const [currentMapPoint, setCurrentMapPoint] = useState(null);
  const [dataSourceContent, setDataSourceContent] = useState(null);
  const [data, setData] = useState<Array<FloodData>>([]);
  const [isNotSupportedArea, setIsNotSupportedArea] = useState(false);
  const [isErrorLoadingData, setIsErrorLoadingData] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [riskCard, setRiskCard] = useState<RiskCard>();

  const floodToolLayerId = useRef("FloodToolGraphicLayer_"+ id);
  const numCountRef = useRef(0);
  const clickListener = useRef(null);
  const graphicsLayer = useRef(null);
  const markerGraphic = useRef(null);
  const coordDecimals = useRef(6);
  const totalResults = useRef(0);
  const mapAddress = useRef(null);
  const searchPoint = useRef(null);

  const openMapWidgets = ReactRedux.useSelector((state: IMState) => {
    const mutableSate = state.mapWidgetsInfo.asMutable();
    const widgetIds = Object.getOwnPropertyNames(mutableSate);
    let isOpen = false;
    widgetIds.forEach((widgetId) => {
      if (mutableSate[widgetId].autoControlWidgetId && widgetId != id)
        isOpen = true;
      return;
    });
    return isOpen;
  });

  const openWidgets = ReactRedux.useSelector((state: IMState) => {
    const mutableSate = state.widgetsRuntimeInfo.asMutable();
    const widgetIds = Object.getOwnPropertyNames(mutableSate);
    let isOpen = false;
    widgetIds.forEach((widgetId) => {
      if (mutableSate[widgetId].state == WidgetState.Opened && widgetId != id)
        isOpen = true;
      return;
    });
    return isOpen;
  });

  const getOpenViews = ReactRedux.useSelector((state: IMState) => {
    return state.queryObject.views;
  });

  const getOpenOverlay = ReactRedux.useSelector((state: IMState) => {
    return state.queryObject.dlg;
  });

  const stateInControllerWidget = ReactRedux.useSelector((state: IMState) => {
    const widgetsRuntimeInfo = state?.widgetsRuntimeInfo;
    return widgetsRuntimeInfo?.[id]?.state;
  });

  // useMemo - The useMemo hook can optimize performance by memoizing the result of a computationally expensive function,
  // and the useCallback hook can memoize a function to optimize the performance of a component
  const openViews = useMemo(() => getOpenViews, [getOpenViews]);
  const openOverlay = useMemo(() => getOpenOverlay, [getOpenOverlay]);
  const anyOpenMapWidgets = useMemo(() => openMapWidgets, [openMapWidgets]);
  const anyOpenWidgets = useMemo(() => openWidgets, [openWidgets]);
  const widgetClosed = useMemo(
    () => stateInControllerWidget === WidgetState.Closed,
    [stateInControllerWidget]
  );
  const widgetOpened = useMemo(
    () => stateInControllerWidget === WidgetState.Opened,
    [stateInControllerWidget]
  );

  const isDsConfigured = () => {
    if (useDataSources && useDataSources.length === 1) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    //Runs only on the first render
    if (debugMode) console.log("before rerun one time useEffect");
    if (coordinateDecimal) coordDecimals.current = coordinateDecimal;
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    //Runs on the first render
    //And any time any dependency value changes // currentJimuMapView
    if (debugMode) console.log(" currentMapPoint");
  }, [currentMapPoint]);

  const onActiveViewChange = (jimuMapView: JimuMapView) => {
    if (debugMode) console.log("onActiveViewChange");
    setCurrentJimuMapView(jimuMapView);
  };

  const renderTool = (dataCopy) => {
    totalResults.current = 0;
    if (restEndPoints.length == numCountRef.current) {
      dataCopy.sort();
      let anotherData = [];
      dataCopy.forEach((element, index) => {
        totalResults.current += dataCopy[index].data?.features.length;
        anotherData.push(dataCopy[index]);
      });

      const riskCard = getRiskCard(anotherData);
      setRiskCard(riskCard);

      setData(anotherData);

      setIsLoading(false);
    }
  };

  const queryData = async (mapPoint: Point, zoomTo: boolean = false) => {
    if (debugMode) console.log("fun - queryData");
    setRiskCard(null);
    setData(null);
    setIsLoading(true);
    setIsNotSupportedArea(false);
    setIsErrorLoadingData(false);
    setCurrentMapPoint(mapPoint);

    if (mapPoint) {
      drawPoint(mapPoint, zoomTo);

      loadArcGISJSAPIModule("esri/layers/FeatureLayer").then((FeatureLayer) => {
        let dataCopy = [];
        numCountRef.current = 1;

        restEndPoints.forEach(async (endPoint, index) => {
          // point buffer
          if (endPoint.buffer > 0) {
            mapPoint = await bufferPoint(
              mapPoint,
              endPoint.buffer,
              endPoint.buffer_units
            );
          }

          dataCopy.push(index);
          if (endPoint.imageServer) {
            loadArcGISJSAPIModule("esri/layers/ImageryLayer")
              .then((ImageryLayer) => {
                const imagelayer: __esri.ImageryLayer = new ImageryLayer({
                  url: endPoint.imageServer,
                });

                imagelayer
                  .load()
                  .then(() => {
                    imagelayer
                      .identify({
                        geometry: mapPoint,
                      })
                      .then((identifyResponse) => {
                        let features = [];
                        features.push({
                          attributes: { value: identifyResponse.value },
                        });
                        var featureSet = new FeatureSet();
                        featureSet.features = features;

                        const screeningData: FloodData = {
                          endPoint: endPoint,
                          data: featureSet,
                        };
                        dataCopy[index] = screeningData;

                        // to ensure all end points responses are in
                        if (restEndPoints.length == numCountRef.current) {
                          renderTool(dataCopy);
                          setIsLoading(false);
                        }

                        numCountRef.current++;
                      })
                      .catch((err) => {
                        if (debugMode) console.warn(err);
                        const screeningData: FloodData = {
                          endPoint: endPoint,
                          data: null,
                        };

                        dataCopy[index] = screeningData;

                        // to ensure all end points responses are in
                        if (restEndPoints.length == numCountRef.current) {
                          renderTool(dataCopy);
                          setIsLoading(false);
                        }

                        numCountRef.current++;
                      });
                  })
                  .catch((err) => {
                    if (debugMode) console.warn(err);
                    const screeningData: FloodData = {
                      endPoint: endPoint,
                      data: null,
                    };

                    dataCopy[index] = screeningData;

                    // to ensure all end points responses are in
                    if (restEndPoints.length == numCountRef.current) {
                      renderTool(dataCopy);
                      setIsLoading(false);
                    }

                    numCountRef.current++;
                  });
              })
              .catch((err) => {
                if (debugMode) console.warn(err);
                const screeningData: FloodData = {
                  endPoint: endPoint,
                  data: null,
                };

                dataCopy[index] = screeningData;

                // to ensure all end points responses are in
                if (restEndPoints.length == numCountRef.current) {
                  renderTool(dataCopy);
                  setIsLoading(false);
                }

                numCountRef.current++;
              });
          } else {
            const layer: __esri.FeatureLayer = new FeatureLayer({
              url: endPoint.featureServer,
            });

            const query = new Query();
            query.geometry = mapPoint;

            query.outSpatialReference =
              currentJimuMapView?.view?.spatialReference;
            query.returnGeometry = false;
            query.outFields = ["*"];
            query.where = endPoint.whereClause ? endPoint.whereClause : "1=1";
            query.num = endPoint.resultRecordCount
              ? endPoint.resultRecordCount
              : 1;
            query.orderByFields = endPoint.orderByFields
              ? endPoint.orderByFields.asMutable()
              : [];

            layer
              .queryFeatures(query)
              .then((result) => {
                const screeningData: FloodData = {
                  endPoint: endPoint,
                  data: result,
                };
                dataCopy[index] = screeningData;

                // to ensure all end points responses are loaded
                if (restEndPoints.length == numCountRef.current) {
                  renderTool(dataCopy);
                  setIsLoading(false);
                }

                if (endPoint.masterService && result.features.length == 0) {
                  setIsNotSupportedArea(true);
                }

                numCountRef.current++;
              })
              .catch((err) => {
                if (debugMode) console.warn(err);
                const screeningData: FloodData = {
                  endPoint: endPoint,
                  data: null,
                };

                dataCopy[index] = screeningData;

                // to ensure all end points responses are in
                if (restEndPoints.length == numCountRef.current) {
                  renderTool(dataCopy);
                  setIsLoading(false);
                }

                numCountRef.current++;
              });
          }
        });
      });
    }
  };

  // disable/enable flood tool based on open widgets open close status change
  useEffect(() => {
    if (debugMode)
      console.log(
        " useEffect widgetClosed, widgetOpened, anyOpenMapWidgets, anyOpenWidgets, openViews"
      );
    removeFloodToolListeners();

    showHideFloodTool();
  }, [
    widgetClosed,
    widgetOpened,
    anyOpenMapWidgets,
    anyOpenWidgets,
    openViews,
    openOverlay,
  ]);

  const onDataSourceCreated = (ds: DataSource): void => {
    if (debugMode) console.log("onDataSourceCreated");
  };

  const onCreateDataSourceFailed = (err: any): void => {
    if (debugMode) console.log("onCreateDataSourceFailed");
  };

  const onDataSourceStatusChange = (
    status: DataSourceStatus,
    preStatus?: DataSourceStatus
  ): void => {
    if (status === DataSourceStatus.NotReady) {
      const localPoint = handleLocalStorage();

      if (localPoint) {
        mapAddress.current = localStorage.getItem("localMapAddress");
        queryData(localPoint, true);
      }
    }
    if (debugMode) console.log("onDataSourceStatusChange");
  };

  const onAllChildDataSourcesCreated = (ds: DataSource): void => {
    if (debugMode) console.log("onAllChildDataSourcesCreated");
  };

  hooks.useUpdateEffect(() => {
    // React effect hook that ignores the first invocation (e.g. on mount)
    //And any time any dependency value changes // currentJimuMapView
    if (debugMode) console.log(" currentJimuMapView");
    removeFloodToolGraphicLayer();
    addFloodToolGraphicLayer();
    showHideFloodTool();

    const urlPoint = handleUrlParameter();

    if (urlPoint) {
      queryData(urlPoint, true); // zoom to for url parameter. Others are set through the search widget.
    } else {
      const dss = useDataSources?.map((dataSource) => {
        if (debugMode) console.log("dataSourceContent");

        return (
          isDsConfigured && (
            <DataSourceComponent
              //onSelectionChange={handleDataSourceSelection}
              //onDataSourceInfoChange={onDataSourceInfoChange}
              useDataSource={dataSource}
              query={{ where: "1=1" } as FeatureLayerQueryParams}
              widgetId={id}
              onDataSourceCreated={onDataSourceCreated}
              onCreateDataSourceFailed={onCreateDataSourceFailed}
              onDataSourceStatusChange={onDataSourceStatusChange}
              onAllChildDataSourcesCreated={onAllChildDataSourcesCreated}
            >
              {dataRender}
            </DataSourceComponent>
          )
        );
      });

      setDataSourceContent(dss);
    }
  }, [currentJimuMapView]);

  const showHideFloodTool = () => {
    if (debugMode) console.log(" showHideFloodTool");

    // TODO - this is a static check for flood too views tab
    // TODO - dynamically find the flood tool views tab that it belong to
    // and use for comparison instead of the hard coded value
    const activeLinks = document.querySelectorAll(".nav-link.active");
    let isFloodView = false;
    //isFloodView =  openViews?.includes("Flood")

    // in the case the active floot tool tab is not in the query parameters
    activeLinks.forEach((x) => {
      if (
        x.attributes["href"]?.value.toLocaleLowerCase().includes("views=flood")
      ) {
        isFloodView = true;
      }
    });

    const isFloodOverlay = openOverlay?.includes("Flood");

    if (isFloodOverlay) {
      // for op up flood tool
      if (widgetClosed || anyOpenMapWidgets || anyOpenWidgets) {
        hideFloodToolLayer();
        removeFloodToolListeners();
      } else {
        showFloodToolLayer();
        addFloodToolListeners();
      }
    } else {
      // for views flood tool
      if (!isFloodView) {
        hideFloodToolLayer();
        removeFloodToolListeners();
      } else if (isFloodView) {
        if (widgetClosed || anyOpenMapWidgets || anyOpenWidgets) {
          hideFloodToolLayer();
          removeFloodToolListeners();
        } else {
          showFloodToolLayer();
          addFloodToolListeners();
        }
      }
    }
  };

  const addFloodToolGraphicLayer = () => {
    if (debugMode) console.log(" addFloodToolGraphicLayer");

    const map = currentJimuMapView?.view?.map;
    if (!map) {
      if (debugMode) console.warn("no map found");
      return;
    }

    graphicsLayer.current = new GraphicsLayer({
      graphics: [markerGraphic.current],
      id: floodToolLayerId.current,
    });
    map?.add(graphicsLayer.current);
  };

  const removeFloodToolGraphicLayer = () => {
    if (debugMode) console.log(" removeFloodToolGraphicLayer");

    const map = currentJimuMapView?.view?.map;
    if (!map) {
      if (debugMode) console.warn("no map found");
      return;
    }

    if (graphicsLayer.current) {
      map?.remove(graphicsLayer.current);
    }
  };

  const hideFloodToolLayer = () => {
    console.log(" hideFloodToolLayer");

    const map = currentJimuMapView?.view?.map;
    if (!map) {
      console.warn("no map found");
      return;
    }
    map.allLayers
      .filter((item) => item.id == floodToolLayerId.current)
      .toArray()
      .forEach((layer) => {
        layer.visible = false;
        layer.listMode = "hide";
      });
  };

  const showFloodToolLayer = () => {
    if (debugMode) console.log(" showFloodToolLayer");
    const map = currentJimuMapView?.view?.map;
    if (!map) {
      if (debugMode) console.warn("no map found");
      return;
    }

    map.allLayers
      .filter((item) => item.id == floodToolLayerId.current)
      .toArray()
      .forEach((layer) => {
        layer.visible = true;
        //layer.listMode = "show"
      });
  };

  const addFloodToolListeners = () => {
    if (debugMode) console.log(" addFloodToolListeners");

    const view = currentJimuMapView?.view;
    if (!view) {
      if (debugMode) console.warn("no view addFloodToolListeners");
      return;
    }

    clickListener.current = view.on("click", (event) => {
      onMapClick(event);
    });
  };

  const removeFloodToolListeners = () => {
    if (debugMode) console.log(" removeFloodToolListeners");
    if (clickListener.current) {
      clickListener.current.remove();
    }
  };

  const addPointGraphic = (zoomTo: boolean = false) => {
    if (debugMode) console.log(" addPointGraphic");

    if (markerGraphic.current) {
      if (graphicsLayer.current) {
        graphicsLayer.current?.add(markerGraphic.current);
        if (zoomTo) {
          zoomToUtils.zoomTo(
            currentJimuMapView?.view,
            {
              layer: graphicsLayer.current,
              graphics: [markerGraphic.current],
            },
            {
              scale: 7000,
            }
          );
        }
      } else {
        if (debugMode) console.warn("no graphicsLayer found");
      }
    } else {
      if (debugMode) console.warn("no markerGraphic found");
    }
  };

  const clearPointGraphic = () => {
    if (debugMode) console.log(" clearPointGraphic");

    if (markerGraphic.current) {
      if (graphicsLayer.current) {
        graphicsLayer.current?.remove(markerGraphic.current);
      } else {
        if (debugMode) console.warn("no graphicsLayer found");
      }
    } else {
      if (debugMode) console.warn("no markerGraphic found");
    }
  };

  const setLocalStorage = (mapPoint, address) => {
    localStorage.setItem("localLat", mapPoint.latitude);
    localStorage.setItem("localLong", mapPoint.longitude);
    localStorage.setItem("localMapAddress", address);
  };

  const clearLocalStorage = () => {
    if (debugMode) console.log(" clearLocalStorage");
    localStorage.removeItem("localLat");
    localStorage.removeItem("localLong");
    localStorage.removeItem("localMapAddress");
  };

  const bufferPoint = async (mapPoint, buffer, buffer_units) => {
    if (debugMode) console.log(" bufferPoint");
    let geometry = null;
    if (
      currentJimuMapView?.view?.spatialReference?.isWGS84 ||
      mapPoint.spatialReference?.isWebMercator
    ) {
      geometry = geometryEngine.geodesicBuffer(
        mapPoint,
        buffer,
        lodash.kebabCase(buffer_units) as any
      ) as __esri.Polygon;
    } else {
      geometry = geometryEngine.buffer(
        mapPoint,
        buffer,
        lodash.kebabCase(buffer_units) as any
      ) as __esri.Polygon;
    }
    return geometry;
  };

  const onMapClick = async (evt) => {
    if (debugMode) console.log(" onMapClick");
    mapAddress.current = null;

    // Changing the reference causes a bug where mark's position is changed the first time
    if (!evt.mapPoint) return;

    evt.stopPropagation();
    //console.log(copyMapPoint)
    const copyMapPoint = Point.fromJSON(evt.mapPoint.toJSON());

    setLocalStorage(copyMapPoint, mapAddress.current);

    queryData(copyMapPoint);
  };

  const handleUrlParameter = () => {
    if (debugMode) console.log(" handleUrlParameter");
    const urlPoint = getQueryParam();
    if (urlPoint) {
      let pt = webMercatorUtils.lngLatToXY(urlPoint.long, urlPoint.lat);
      const x = pt[0];
      const y = pt[1];

      const mapSr = currentJimuMapView?.view?.spatialReference;
      //const point = new Point({ latitude:x, longitude:y, spatialReference: mapSr })
      const point = new Point({ x: x, y: y, spatialReference: mapSr });

      if (point) {
        return point;
      } else {
        return null;
      }
    }
  };

  const handleLocalStorage = () => {
    if (debugMode) console.log(" handleLocalStorage");
    const localLat = localStorage.getItem("localLat");
    const localLong = localStorage.getItem("localLong");

    if (localLat && localLong) {
      let pt = webMercatorUtils.lngLatToXY(localLong, localLat);
      const x = pt[0];
      const y = pt[1];

      const mapSr = currentJimuMapView?.view?.spatialReference;
      const point = new Point({ x: x, y: y, spatialReference: mapSr });

      if (point) {
        return point;
      } else {
        return null;
      }
    }
  };

  const drawPoint = (mapPoint: Point, zoomTo: boolean = false) => {
    if (markerGraphic.current) {
      clearPointGraphic();
    }

    markerGraphic.current = getMarkerGraphic(mapPoint);
    addPointGraphic(zoomTo);
  };

  const getMarkerGraphic = (mapPoint) => {
    const symbol = new PictureMarkerSymbol({
      url: require("./assets/pin-exb.svg"),
      width: 12,
      height: 22,
      yoffset: 11,
    });
    return new Graphic({
      geometry: mapPoint,
      symbol,
    });
  };

  hooks.useUnmount(() => {
    removeFloodToolGraphicLayer();
    removeFloodToolListeners();
    // remove views= to force page to load default views tab (Flood Tool)
    removeViewsParam();
  });

  const dataRender = (ds: DataSource) => {
    if (debugMode) console.log("dataRender");

    if (ds && ds.getStatus() === DataSourceStatus.Loaded) {
      ds.getRecords().map((r, i) => {
        if (debugMode) console.log(r);
        const point = Point.fromJSON(r.getGeometry());
        if (
          point.latitude != currentMapPoint?.latitude &&
          point.longitude != currentMapPoint?.longitude
        ) {
          mapAddress.current = r.getFeature()?.getAttribute("Default Address");
          setLocalStorage(point, mapAddress.current);
          searchPoint.current = point;
        }

        ds.setStatus(DataSourceStatus.NotReady);
      });
    }

    return null;
  };

  const getDataResult = (featureServiceId: string) => {
    return data.find((x) => x.endPoint.featureServiceId == featureServiceId);
  };

  const getRiskCard = (anotherData) => {
    let card = null;
    displaySections.map((displaySection) => {
      if (displaySection.displayType == "riskCard") {
        anotherData.map((floodData) => {
          displaySection.riskCards.map((riskCard) => {
            if (
              floodData.endPoint.featureServiceId == riskCard.featureServiceId
            ) {
              floodData.data?.features.map((feature) => {
                if (
                  riskCard.indicatorValues.find(
                    (a) =>
                      a.toString() ==
                      feature.attributes[riskCard.indicatorField]
                  )
                ) {
                  card = riskCard;
                  return;
                }
                return;
              });
            }
          });
        });
      }
    });

    return card;
  };

  const getFlood3dData = () => {
    let flood3dCard: Flood3dCard = null;
    let message = "";
    let wse = "";
    let lag = "";
    let hag = "";
    let waterElevation = 0;
    let show3DModel = false;
    displaySections.map((displaySection) => {
      if (displaySection.displayType == "flood3dCard") {
        flood3dCard = displaySection.flood3dCard;
        return;
      }
    });

    if (flood3dCard) {
      const dataResult = getDataResult(flood3dCard.featureServiceId);
      if (dataResult?.data?.features.length > 0) {
        dataResult?.data?.features.map((feature) => {

          hag = feature.attributes[flood3dCard.hagField].toFixed(1).toString();
          lag = feature.attributes[flood3dCard.lagField].toFixed(1).toString();

          console.log('lag, hag:', lag, hag)

          if (
            feature.attributes[flood3dCard.wseField] != "" &&
            feature.attributes[flood3dCard.wseField] != null
          ) {

            wse = feature.attributes[flood3dCard.wseField].toFixed(1).toString();
            
            console.log('wse:', wse)

            if (
              feature.attributes[flood3dCard.lagField] >
              feature.attributes[flood3dCard.wseField]
            ) {
              const freeboard = (
                feature.attributes[flood3dCard.lagField] -
                feature.attributes[flood3dCard.wseField]
              )
                .toFixed(1)
                .toString();
              message = flood3dCard.WSELessThanLAGMessage
              .replace("<freeboard>", freeboard)
              .replace("<lag>", lag)
              .replace("<hag>", hag)
              .replace("<wse>", wse);

              console.log(message)

              waterElevation =
                feature.attributes[flood3dCard.wseField] -
                feature.attributes[flood3dCard.lagField];
                // freeboard available so show3DModel = false
            }

            if (
              feature.attributes[flood3dCard.lagField] <
              feature.attributes[flood3dCard.wseField]
            ) {
              const depth = (
                feature.attributes[flood3dCard.wseField] -
                feature.attributes[flood3dCard.lagField]
              )
                .toFixed(1)
                .toString();
              message = flood3dCard.WSEGreaterThanLAGMessage
              .replace("<depth>", depth)
              .replace("<lag>", lag)
              .replace("<hag>", hag)
              .replace("<wse>", wse);
              
              console.log(message)
              
              waterElevation =
                feature.attributes[flood3dCard.wseField] -
                feature.attributes[flood3dCard.lagField];
              show3DModel = true;
              console.log("show3D model hit")
            }
          } else {
            message = flood3dCard.nullWSEMessage;
          }
        });
      } else {
        message = flood3dCard.noResultMessage;
      }
    }

    const flood3dData: Flood3dData = {
      message: message,
      wse: wse,
      lag: lag,
      hag: hag,
      address: mapAddress.current,
      lat: currentMapPoint?.latitude,
      long: currentMapPoint?.longitude,
      waterElevation: waterElevation,
      show3DModel: show3DModel,
    };

    return flood3dData;
  };

  // Renderer

  return (
    <div
      css={getStyle(theme)}
      className="jimu-widget"
      style={{ overflow: "auto" }}
    >
      <div className="flood-tool">
        <div>{dataSourceContent}</div>
        <JimuMapViewComponent
          useMapWidgetId={useMapWidgetIds?.[0]}
          onActiveViewChange={onActiveViewChange}
        />
        {data &&
          !isNotSupportedArea &&
          !isErrorLoadingData &&
          currentMapPoint && (
            <div>
              {displaySections.map((displaySection) => {
                const flood3dData = getFlood3dData();
                const infoIcon = require('./assets/info-icon.svg')
                var current_url = window.location.href;
                console.log('current_url', current_url)
                var base_url = current_url.split('page')[0];
                console.log('base_url', base_url)
                return (
                  <div>
                    {displaySection.sectionLabel != "" ? (
                      <h4 className="info-card-header">
                        {displaySection.sectionLabel}

                        {displaySection.sectionLabelHelpPage && (
                          <Link 
                          // local: /experience/4/page/
                          // prod ?page=
                          to = {`?page=${displaySection.sectionLabelHelpPage}`}
                          type = "link"
                          replace = "true"
                          target = "_self"
                          >
                            <Icon icon={infoIcon} color="red" width="20px" height="20px"/> 

                            {/* <img src={require('./assets/info-icon.svg')} height={24} /> */}
                          </Link>

                        )}
                      </h4>
                    ) : (
                      ""
                    )}

                    {displaySection.displayType == "riskCard" && (
                      <div>
                        <RiskCardComponent
                          className="avatar-placeholder"
                          riskCard={riskCard}
                        />
                      </div>
                    )}

                    {displaySection.displayType == "flood3dCard" && (
                      <div className="info-card-feature">
                        {displaySection.displayFields?.map((displayField) => {
                          const dataResult = getDataResult(
                            displayField.featureServiceId
                          );
                          return (
                            <FloodSectionFieldComponent
                              dataResult={dataResult}
                              displayField={displayField}
                            />
                          );
                        })}
                        {displaySection.displayFields.length > 0 ? <hr /> : ""}

                        <FloodWidgetContext.Provider
                          value={{ theme, currentMapPoint, flood3dData }}
                        >
                          {totalResults.current > 0 &&
                            currentMapPoint &&
                            show3dView && <Card3D />}
                        </FloodWidgetContext.Provider>
                      </div>
                    )}

                    {displaySection.displayType == "data" && (
                      <div className="info-card-feature">
                        {displaySection.displayFields.map((displayField) => {
                          const dataResult = getDataResult(
                            displayField.featureServiceId
                          );
                          return (
                            <FloodSectionFieldComponent
                              dataResult={dataResult}
                              displayField={displayField}
                            />
                          );
                        })}
                        {displaySection.sectionLabel != "" ? "" : <hr />}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="info-card-feature">
                {showLatLong && (
                  <div className="flood-section-field">
                    <span className="font-weight-bold">Lat, Long: </span>
                    <span>
                      ({currentMapPoint.latitude.toFixed(coordDecimals.current)}
                      ,{" "}
                      {currentMapPoint.longitude.toFixed(coordDecimals.current)}
                      )
                    </span>
                  </div>
                )}

                {showAddress && mapAddress.current && (
                  <div className="flood-section-field">
                    <span className="font-weight-bold">Address: </span>
                    <span>{mapAddress.current}</span>
                  </div>
                )}

                {showExternalMapLinks && (
                  <ExternalViewComponent
                    lat={currentMapPoint.latitude}
                    long={currentMapPoint.longitude}
                  />
                )}
              </div>
            </div>
          )}

        {data && isNotSupportedArea && (
          <div className="flood-warning-text">
            {" "}
            <p>
              The specified location appears to be outside of Virginia therefore
              VFRIS cannot determine flood risk information.
            </p>
          </div>
        )}
        {data && isErrorLoadingData && (
          <div className="flood-warning-text">
            {" "}
            <p>
              There was a problem querying the flood risk information for this
              location.
            </p>
          </div>
        )}

        {!currentMapPoint && (
          <div className="flood-warning-text">
            <h3>Flood Tool Instructions</h3>
            <p>
              Click on the map or use the address search to find out if the
              location is in a flood zone.
            </p>
          </div>
        )}
      </div>
      {isLoading && (
        <div className="flood-loader">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default Widget;
