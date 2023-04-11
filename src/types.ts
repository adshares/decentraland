import { Creative } from './creative'

export declare interface IPlacement extends IEntity {
  name: string

  position?: string

  getProps (): TPlacementProps;

  renderMessage (message: string, icon: string): void;

  renderCreative (creative: Creative): void;

  renderInfoBox (url: string): void;

  reset (): void;
}

export declare interface IStand extends IEntity {
  getPlacements (): IPlacement[];
}

export declare type TPlacementProps = {
  name: string | null,
  width: number,
  height: number,
  depth: number | null,
  no: number | null,
  types: string[] | null,
  mimes: string[] | null,
}

export declare type TRatio = '9:16' | '3:4' | '1:1' | '4:3' | '16:9'
export declare type TUIPlacementPosition = 'top' | 'bottom' | 'left' | 'right' | 'center'

export type ITimerComponent = {
  id?: string
  elapsedTime: number
  targetTime: number
  onTargetTimeReached: (components: ITimerComponent[], index: number) => void
}

export declare type TCustomCommand = {
  teleportTo?: {
    coordinates: string
    delay?: number
  }
}
