import React, { ComponentProps } from 'react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/tailwind/utils';

import { FormFieldError } from '@/components/form';
import { useFormField } from '@/components/form/form-field';
import { FieldProps } from '@/components/form/form-field-controller';
import { MultiSelect, MultiSelectProps } from '@/components/ui/multi-select';

type OptionBase = { id: string; label: string; disabled?: boolean };

type StoredValue = string[];
type UiValue = OptionBase[];

export type FieldMultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = FieldProps<
  TFieldValues,
  TName,
  TTransformedValues,
  {
    type: 'multi-select';
    containerProps?: ComponentProps<'div'>;

    /** Full list of selectable options */
    options: ReadonlyArray<OptionBase>;
  } & Omit<MultiSelectProps, 'value' | 'onChange' | 'options' | 'multiple'>
>;

function idsToOptions(
  ids: unknown,
  options: ReadonlyArray<OptionBase>
): UiValue {
  if (!Array.isArray(ids)) return [];

  // If the form already stores OptionBase[], just pass through
  if (
    ids.every(
      (x) =>
        x &&
        typeof x === 'object' &&
        'id' in (x as TODO) &&
        'label' in (x as TODO)
    )
  ) {
    return ids as UiValue;
  }

  const byId = new Map(options.map((o) => [o.id, o]));
  return (ids as unknown[])
    .filter((x): x is string => typeof x === 'string')
    .map((id) => byId.get(id))
    .filter(Boolean) as UiValue;
}

function optionsToIds(value: unknown): StoredValue {
  if (!Array.isArray(value)) return [];

  return (value as unknown[])
    .filter(
      (x): x is OptionBase =>
        !!x && typeof x === 'object' && 'id' in (x as TODO)
    )
    .map((o) => o.id);
}

export function FieldMultiSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(props: FieldMultiSelectProps<TFieldValues, TName, TTransformedValues>) {
  const {
    name,
    control,
    defaultValue,
    shouldUnregister,
    containerProps,
    options,
    ...rest
  } = props;

  const ctx = useFormField();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState }) => {
        const uiValue = idsToOptions(field.value, options);

        const handleChange: MultiSelectProps['onChange'] = (next) => {
          // next is OptionBase[] (or null-ish depending on HeadlessUI internals)
          const safeNext = (next ?? []) as OptionBase[];
          field.onChange(optionsToIds(safeNext));
        };

        return (
          <div
            {...containerProps}
            className={cn('flex flex-col gap-1', containerProps?.className)}
          >
            <MultiSelect
              options={options}
              {...rest}
              value={uiValue}
              onChange={handleChange}
              disabled={rest.disabled}
              invalid={fieldState.error ? true : undefined}
              aria-invalid={fieldState.error ? true : undefined}
              aria-describedby={
                !fieldState.error
                  ? `${ctx.descriptionId}`
                  : `${ctx.descriptionId} ${ctx.errorId}`
              }
            />
            <FormFieldError />
          </div>
        );
      }}
    />
  );
}

export default FieldMultiSelect;
