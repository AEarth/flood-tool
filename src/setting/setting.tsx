/** @jsx jsx */
import {
  React,
  jsx,
  Immutable,
  defaultMessages as jimucoreMessages,
  moduleLoader,
  AllDataSourceTypes,
  UseDataSource,
} from "jimu-core";
import { AllWidgetSettingProps } from "jimu-for-builder";
import {
  defaultMessages as jimuiMessages,
  hooks,
  NumericInput,
  Switch,
  TextArea,
  defaultMessages as jimuUiDefaultMessages,
} from "jimu-ui";
import {
  MapWidgetSelector,
  SettingRow,
  SettingSection,
} from "jimu-ui/advanced/setting-components";
import { IMConfig } from "../config";
import defaultMessages from "./translations/default";
import { Fragment } from "react";
import { ClickOutlined } from "jimu-icons/outlined/application/click";
import { getSettingStyle } from "./style";

import { DataSourceSelector } from "jimu-ui/advanced/data-source-selector";

const { useState, useEffect, useRef } = React;

type SettingProps = AllWidgetSettingProps<IMConfig>;

const Setting = (props: SettingProps): React.ReactElement => {
  const {
    id,
    theme,
    onSettingChange,
    config: propConfig,
    useMapWidgetIds,
  } = props;

  const {
    restEndPoints,
    displaySections,
    useDataSources,
    useDataSourcesEnabled,
    showLatLong,
    show3dView,
    showAddress,
    showExternalMapLinks,
    coordinateDecimal,
  } = propConfig;
  // state
  const [restEndPointsString, setRestEndPointsString] = useState("");
  const [displaySectionsString, setDisplaySectionsString] = useState("");
  const [modulesLoaded, setModulesLoaded] = useState(false);
  // translate
  const translate = hooks.useTranslate(
    defaultMessages,
    jimuiMessages,
    jimucoreMessages
  );
  const selectMapWidget = translate(defaultMessages.selectMapWidget);

  const displayOptions = translate(defaultMessages.displayOptions);
  const coordinateDecimalLabel = translate("coordinateDecimal");
  const showLatLongLabel = translate(defaultMessages.showLatLong);
  const showExternalMapLinksLabel = translate(
    defaultMessages.showExternalMapLinks
  );
  const showAddressLabel = translate(defaultMessages.showAddress);
  const show3dViewLabel = translate(defaultMessages.show3dView);
  const displaySectionsConfigurationLabel = translate(
    defaultMessages.displaySectionsConfiguration
  );
  const endpointsConfigurationLabel = translate(
    defaultMessages.endpointsConfiguration
  );
  const useAddressSearchPointLabel = translate(
    defaultMessages.useAddressSearchPoint
  );

  const selectMapTips = translate("selectMapTips");
  const endPointsJson = translate("endPointsJson");
  const displaySectionsJson = translate("displaySectionsJson");
  // global variabl
  const wkidUtilsRef = useRef(null);

  useEffect(() => {
    setRestEndPointsString(JSON.stringify(restEndPoints));
    setDisplaySectionsString(JSON.stringify(displaySections));
    const useMap = useMapWidgetIds?.length > 0;
    if (useMap && !modulesLoaded) {
      moduleLoader.loadModule("jimu-core/wkid").then((module) => {
        wkidUtilsRef.current = module;
        setModulesLoaded(true);
      });
    }
    // eslint-disable-next-line
  }, [useMapWidgetIds]);

  const handleCoordinateDecimal = (valueInt: number) => {
    onPropertyChange("coordinateDecimal", valueInt);
  };

  const handleRestEndPoints = (endpoints) => {
    setRestEndPointsString(endpoints.target.value);
    onPropertyChange("restEndPoints", JSON.parse(endpoints.target.value));
  };

  const handleDisplaySections = (displaySections) => {
    setDisplaySectionsString(displaySections.target.value);
    onPropertyChange(
      "displaySections",
      JSON.parse(displaySections.target.value)
    );
  };

  const onPropertyChange = (name, value) => {
    if (value === propConfig[name]) return;
    const newConfig = propConfig.set(name, value);
    const newProps = { id, config: newConfig };
    onSettingChange(newProps);
  };

  const useMap = useMapWidgetIds?.length > 0;

  const onToggleUseDataEnabled = (useDataSourcesEnabled: boolean) => {
    onPropertyChange("useDataSourcesEnabled", useDataSourcesEnabled);
  };

  const onDataSourceChange = (useDataSources: UseDataSource[]) => {
    onPropertyChange("useDataSources", Immutable(useDataSources));
  };

  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    onSettingChange({ id, useMapWidgetIds });
  };

  return (
    <div
      className="widget-setting-coordinates jimu-widget-setting"
      css={getSettingStyle(theme)}
    >
      <SettingSection
        title={selectMapWidget}
        role="group"
        aria-label={selectMapWidget}
      >
        <SettingRow>
          <MapWidgetSelector
            onSelect={onMapWidgetSelected}
            useMapWidgetIds={useMapWidgetIds}
          />
        </SettingRow>
      </SettingSection>

      {!useMap && (
        <div className="empty-placeholder w-100">
          <div className="empty-placeholder-inner">
            <div className="empty-placeholder-icon">
              <ClickOutlined size={48} />
            </div>
            <div className="empty-placeholder-text" id="coordinates-blank-msg">
              {selectMapTips}
            </div>
          </div>
        </div>
      )}

      {useMap && (
        <Fragment>
          <SettingSection
            title={translate(defaultMessages.screeningToolSetting)}
            role="group"
            aria-label={translate(defaultMessages.screeningToolSetting)}
          >
            <SettingRow flow="wrap">
              <div className="w-100">
                <DataSourceSelector
                  buttonLabel={useAddressSearchPointLabel}
                  types={Immutable([AllDataSourceTypes.FeatureLayer])}
                  disableAddData={true}
                  isMultiple={false}
                  mustUseDataSource
                  useDataSources={useDataSources}
                  useDataSourcesEnabled={useDataSourcesEnabled}
                  onToggleUseDataEnabled={onToggleUseDataEnabled}
                  onChange={onDataSourceChange}
                  widgetId={props.id}
                  hideTabs={Immutable(["ADDED"])}
                  disableDataView={true}
                  hideHeader={false}
                />
              </div>
            </SettingRow>
          </SettingSection>

          <SettingSection
            title={endpointsConfigurationLabel}
            role="group"
            aria-label={endpointsConfigurationLabel}
          >
            <SettingRow flow="wrap" label={endpointsConfigurationLabel}>
              <div className="w-100">
                <TextArea
                  aria-label={endPointsJson}
                  value={restEndPointsString}
                  onChange={handleRestEndPoints}
                />
              </div>
            </SettingRow>
          </SettingSection>
          <SettingSection
            title={displaySectionsConfigurationLabel}
            role="group"
            aria-label={displaySectionsConfigurationLabel}
          >
            <SettingRow flow="wrap" label={displaySectionsConfigurationLabel}>
              <div className="w-100">
                <TextArea
                  aria-label={displaySectionsJson}
                  value={displaySectionsString}
                  onChange={handleDisplaySections}
                />
              </div>
            </SettingRow>
          </SettingSection>

          <SettingSection
            title={displayOptions}
            role="group"
            aria-label={displayOptions}
          >
            <SettingRow flow="wrap" label={coordinateDecimalLabel}>
              <NumericInput
                size="sm"
                value={coordinateDecimal}
                precision={0}
                min={0}
                max={10}
                onChange={handleCoordinateDecimal}
                aria-label={coordinateDecimalLabel}
                className="w-100"
              />
            </SettingRow>
            <SettingRow label={showLatLongLabel}>
              <Switch
                className="can-x-switch"
                checked={showLatLong}
                data-key="showLatLong"
                onChange={(evt) => {
                  onPropertyChange("showLatLong", evt.target.checked);
                }}
                aria-label={showLatLongLabel}
              />
            </SettingRow>

            <SettingRow label={showAddressLabel}>
              <Switch
                className="can-x-switch"
                checked={showAddress}
                data-key="showAddress"
                onChange={(evt) => {
                  onPropertyChange("showAddress", evt.target.checked);
                }}
                aria-label={showAddressLabel}
              />
            </SettingRow>

            <SettingRow label={showExternalMapLinksLabel}>
              <Switch
                className="can-x-switch"
                checked={showExternalMapLinks}
                data-key="showExternalMapLinks"
                onChange={(evt) => {
                  onPropertyChange("showExternalMapLinks", evt.target.checked);
                }}
                aria-label={showExternalMapLinksLabel}
              />
            </SettingRow>

            <SettingRow label={show3dViewLabel}>
              <Switch
                className="can-x-switch"
                checked={show3dView}
                data-key="show3dView"
                onChange={(evt) => {
                  onPropertyChange("show3dView", evt.target.checked);
                }}
                aria-label={show3dViewLabel}
              />
            </SettingRow>
          </SettingSection>
        </Fragment>
      )}
    </div>
  );
};

export default Setting;
