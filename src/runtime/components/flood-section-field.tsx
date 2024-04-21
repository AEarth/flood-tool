/** @jsx jsx */
import Color from 'color'
import { React, css, jsx, IconResult, classNames, polished } from 'jimu-core'
import { Button, Icon, ButtonProps, ButtonSize, Tooltip } from 'jimu-ui'
import { DisplayField, FloodData } from '../../config'

export const LABEL_HEIGHT = 21
export type AvatarSize = ButtonSize


const getColor = (floodType: 'high' | 'medium' | 'low' | 'none'): string => {
  switch (floodType) {
    case 'high':
      return 'red'
    case 'medium':
      return 'orange'
    case 'low':
      return 'gray'
    case 'none':
      return 'yellow'
    default:
      return 'gray'
  }
}

function convertToTitleCase(str) {
  if (!str) {
      return ""
  }
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

export interface FloodSectionFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  dataResult: FloodData,
  displayField: DisplayField,
}

const useStyle = () => {
  return React.useMemo(() => {
    const width = length
    return css`
      display: flex;
      align-items:center;
      flex-direction: row;
      justify-content: 'left'};
      width: ${polished.rem(width)} !important;
    `
  }, [])
}

export const FloodSectionFieldComponent = React.forwardRef((props: FloodSectionFieldProps, ref: React.RefObject<HTMLButtonElement>) => {
  const {
    dataResult,
    displayField
  } = props

  const cssStyle = useStyle()

  const getLinkReference = (linkReference, value) => {
    return linkReference.replace("<value>", value)
  }

  const isValidHttpUrl = (string) => {
    let url;
    
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:";
  }

  return (
    <div
      className={classNames('flood-section-field')}
      css={cssStyle}
    >

      {!displayField.staticValue ?
      (
        dataResult?.data?.features.map(feature => {
          return (
            <div className='info-card-attribute'>
              <span className='font-weight-bold'>{displayField.label}: </span>
                {
                  displayField.display == 'link' && isValidHttpUrl(feature.attributes[displayField.valueField])  &&
                  <a className='info-card-link' href={feature.attributes[displayField.valueField]} title={displayField.label} target='_blank' >
                    {displayField.linkLabel ? displayField.linkLabel :
                      displayField.label}</a>
                }
                {
                  displayField.display == 'linkReference' &&
                  displayField.linkReference1Label && displayField.linkReference1Url &&
                  <a className='info-card-link' href={getLinkReference(displayField.linkReference1Url, feature.attributes[displayField.valueField])}
                    title={displayField.linkReference1Label} target='_blank' >
                    {
                      displayField.linkReference1Label
                    }
                  </a>
                }
                {
                  displayField.display == 'linkReference' &&
                  displayField.linkReference2Label && displayField.linkReference2Url &&
                  <span> | <a className='info-card-link' href={getLinkReference(displayField.linkReference2Url, feature.attributes[displayField.valueField])}
                    title={displayField.linkReference2Label} target='_blank' >
                    {
                      displayField.linkReference2Label
                    }
                  </a></span>
                }
                {
                  displayField.display == 'linkReference' &&
                  displayField.linkReference3Label && displayField.linkReference3Url &&
                  <span> | <a className='info-card-link' href={getLinkReference(displayField.linkReference3Url, feature.attributes[displayField.valueField])}
                    title={displayField.linkReference3Label} target='_blank' >
                    {
                      displayField.linkReference3Label
                    }
                  </a></span>
                }
                {
                  displayField.display == 'keyValue' &&
                  displayField.format == "date" &&
                  <span>{new Date(feature.attributes[displayField.valueField]).toLocaleDateString()}</span>

                }
                {
                  displayField.display == 'keyValue' &&
                  displayField.format == "normal" &&
                  <span> {feature.attributes[displayField.valueField]} </span>
                }

                {
                  displayField.display == 'keyValuePair' &&
                  displayField.format == "normal" &&
                    <span>
                      {feature.attributes[displayField.valueField]}
                      {feature.attributes[displayField.valueField2] ? ` (${convertToTitleCase(feature.attributes[displayField.valueField2])})` : ''}
                    </span>
                }


            </div>
          )
        })
      )
      :
      (
        <div className='info-card-attribute'>
          <span className='font-weight-bold'>{displayField.label}: </span>
          <span>{
            displayField.display == 'link' ?
              <a className='info-card-link' href={displayField.staticValue} title={displayField.label} target='_blank' >
                {displayField.linkLabel ? displayField.linkLabel :
                  displayField.label}</a> :
              displayField.format == "date" ?
                new Date(displayField.staticValue).toLocaleDateString() :
                displayField.staticValue
          }
          </span>
        </div>
      )}
    </div>
  )
})
