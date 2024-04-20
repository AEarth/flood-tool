/** @jsx jsx */
import Color from 'color'
import { React, css, jsx, IconResult, classNames, polished } from 'jimu-core'
import { Button, Icon, ButtonProps, ButtonSize, Tooltip } from 'jimu-ui'

export const LABEL_HEIGHT = 21
export type AvatarSize = ButtonSize


const getColor = (floodType: 'high' | 'medium' | 'low' |'none'): string => {
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



export interface ExternalViewProps extends React.HTMLAttributes<HTMLDivElement> {
  lat: any
  long: any
}

const useStyle = () => {
  return React.useMemo(() => {
    const width = length
    return css`
      display: flex;
      align-items:center;
      flex-direction: row;
      justify-content: 'center'};
      width: ${polished.rem(width)} !important;
      .external-view-card {
        margin: 10px 0px;
        padding: 10px;
      }
      .external-view-card img{
        margin-right: 10px;
        cursor: pointer;
      }
    `
  }, [])
}

export const ExternalViewComponent = React.forwardRef((props: ExternalViewProps, ref: React.RefObject<HTMLButtonElement>) => {
  const {
    lat,
    long
  } = props

  const cssStyle = useStyle()


  const openGoogle = () => {

    window.open("https://maps.google.com/maps?q=" + lat + "," + long, "_blank")
  }

  const openGoogleStreetView = () => {

    window.open("    http://maps.google.com/maps?q=&layer=c&cbll=" + lat + "," + long + "&cbp=11,0,0,0,0", "_blank")
  }

  const openBing = () => {
    window.open("http://bing.com/maps/default.aspx?cp=" + lat + "~" + long + "&sp=point." + lat + "_" + long + "_You%20Are%20Here&lvl=17&style=r", "_blank")
    
  }

  const openStreetMap = () => {
    window.open("http://www.openstreetmap.org/?mlat=" + lat + "&mlon=" + long)
  }
  return (
    <div
      className={classNames('external-view-card',)}
      css={cssStyle}
    >
       <img onClick={openGoogleStreetView}  src={require('./../assets/google-street-view-icon.png')} height={"25"} />
       <img onClick={openGoogle}  src={require('./../assets/google-icon.png')} height={"25"} />
       <img onClick={openBing}  src={require('./../assets/bing-icon.png')} height={"25"} />
       <img onClick={openStreetMap}  src={require('./../assets/open-street-icon.png')} height={"25"} />
    </div>
  )
})
