import React, { useRef, useState } from 'react';
import { RadioGroup, cn } from '@nextui-org/react';
import { useThrottleFn } from '@reactuses/core';
import nobg from '../assets/img/nobg.svg';
import * as m from '../paraglide/messages';

interface BackgroundComponentProps {
  onChangeBg: (backgroundColor: string) => void;
}

interface CustomRadioProps {
  value: string;
  checkedColor: string;
  onChange: (value: string) => void;
}

interface ColorPickerProps {
  onChange: CustomRadioProps['onChange'];
  renderTrigger: (openColorPicker: () => void) => React.ReactNode;
}

const colorArr = [
  'transparent',
  'colorPicker',
  '#000000',
  '#ffffff',

  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',

  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',

  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
];

const ColorPicker: React.FC<ColorPickerProps> = ({
  renderTrigger,
  onChange,
}) => {
  const [color, setColor] = useState('#000000');
  const colorInputRef = useRef<HTMLInputElement>(null);

  const { run: handleColorChange } = useThrottleFn(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setColor(event.target.value);
      onChange(event.target.value);
    },
    300
  );
  const openColorPicker = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };
  return (
    <>
      <input
        type='color'
        value={color}
        ref={colorInputRef}
        onChange={handleColorChange}
      />
      {renderTrigger(openColorPicker)}
    </>
  );
};

const CustomRadio: React.FC<CustomRadioProps> = ({
  value,
  checkedColor,
  onChange,
}) => {
  const renderTrigger: ColorPickerProps['renderTrigger'] = (
    openColorPicker
  ) => {
    return (
      <img
        className='absolute left-0 top-0'
        src='data:image/png;base64,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'
        onClick={openColorPicker}
      />
    );
  };

  return (
    <span
      className={cn(
        'w-16 h-16 relative rounded-lg cursor-pointer overflow-hidden',
        checkedColor === value ||
          (!colorArr.includes(checkedColor) &&
            checkedColor !== '' &&
            value === 'colorPicker')
          ? 'selected-color'
          : ''
      )}
      style={{
        backgroundColor: value,
        border: ['#ffffff', 'transparent'].includes(value)
          ? '1px solid #dddddd'
          : 'none',
      }}
      onClick={() => {
        onChange(value);
      }}
    >
      {value === 'transparent' && (
        <img
          className='absolute left-1/2 top-1/2'
          style={{
            transform: 'translate(-50%, -50%)',
          }}
          src={nobg}
        />
      )}
      {value === 'colorPicker' && (
        <ColorPicker onChange={onChange} renderTrigger={renderTrigger} />
      )}
    </span>
  );
};

const Background: React.FC<BackgroundComponentProps> = ({ onChangeBg }) => {
  const [checkedColor, setCheckedColor] = useState('transparent');
  const handleChangeColor = (value: string) => {
    setCheckedColor(value);
    if (value !== 'colorPicker') {
      onChangeBg(value);
    }
  };
  return (
    <RadioGroup orientation='horizontal' label={m.change_background()}>
      {colorArr.map((item) => (
        <CustomRadio
          key={item}
          value={item}
          onChange={handleChangeColor}
          checkedColor={checkedColor}
        />
      ))}
    </RadioGroup>
  );
};

export default Background;
