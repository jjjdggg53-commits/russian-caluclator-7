/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Game {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  htmlCode: string;
}

export type AccessMode = 'calculator' | 'player' | 'admin';

export interface CalculatorState {
  display: string;
  equation: string;
  isLocked: boolean;
}
