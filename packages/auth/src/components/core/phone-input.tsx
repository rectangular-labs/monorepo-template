"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@rectangular-labs/ui/core/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@rectangular-labs/ui/core/input-group";
import { CaretUpDown, Check } from "@rectangular-labs/ui/components/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@rectangular-labs/ui/core/popover";
import { ScrollArea } from "@rectangular-labs/ui/core/scroll-area";
import { ComponentRef, useRef, useState, type ComponentPropsWithRef, type Ref } from "react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { cn } from "@rectangular-labs/ui/utils";

type PhoneInputProps = Omit<ComponentPropsWithRef<"input">, "onChange" | "value"> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange" | "inputComponent"> & {
    onChange?: (value: RPNInput.Value) => void;
  };

type PhoneInputComponentProps = ComponentPropsWithRef<"input"> & {
  ref?: ComponentPropsWithRef<"input">["ref"];
};

type PhoneInputRootProps = PhoneInputProps & {
  ref?: Ref<ComponentRef<typeof RPNInput.default>>;
};

function PhoneInput({ className, onChange, value, ref, ...props }: PhoneInputRootProps) {
  return (
    <RPNInput.default
      {...props}
      className={cn("w-full", className)}
      containerComponent={PhoneInputContainer}
      countrySelectComponent={CountrySelect}
      flagComponent={FlagComponent}
      inputComponent={PhoneNumberInput}
      onChange={(nextValue) => onChange?.(nextValue || ("" as RPNInput.Value))}
      smartCaret={false}
      {...(ref ? { ref } : {})}
      {...(value !== undefined ? { value } : {})}
    />
  );
}

function PhoneNumberInput({ className, ref, ...props }: PhoneInputComponentProps) {
  return <InputGroupInput {...props} className={cn("min-w-0", className)} ref={ref} />;
}

function PhoneInputContainer({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <InputGroup {...props} className={className} />;
}

type CountryEntry = {
  label: string;
  value: RPNInput.Country | undefined;
};

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
};

function CountrySelect({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      modal
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          setSearchValue("");
        }
      }}
      open={isOpen}
    >
      <PopoverTrigger
        render={
          <InputGroupAddon align="inline-start" className="gap-1 border-r border-input ps-0">
            <InputGroupButton
              aria-label="Select country"
              className="rounded-none border-0 px-2.5"
              disabled={disabled}
              size="sm"
              variant="ghost"
            >
              <FlagComponent country={selectedCountry} countryName={selectedCountry} />
              <CaretUpDown className={cn("-mr-1 size-4", disabled ? "opacity-30" : "opacity-60")} />
            </InputGroupButton>
          </InputGroupAddon>
        }
      />

      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            onValueChange={(nextValue) => {
              setSearchValue(nextValue);
              setTimeout(() => {
                const viewport = scrollAreaRef.current?.querySelector(
                  "[data-radix-scroll-area-viewport]",
                );
                if (viewport instanceof HTMLElement) {
                  viewport.scrollTop = 0;
                }
              }, 0);
            }}
            placeholder="Search country..."
            value={searchValue}
          />

          <CommandList>
            <ScrollArea className="h-72" ref={scrollAreaRef}>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      country={value}
                      countryName={label}
                      key={value}
                      onChange={onChange}
                      onSelectComplete={() => setIsOpen(false)}
                      selectedCountry={selectedCountry}
                    />
                  ) : null,
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country;
  onChange: (country: RPNInput.Country) => void;
  onSelectComplete: () => void;
}

function CountrySelectOption({
  country,
  countryName,
  selectedCountry,
  onChange,
  onSelectComplete,
}: CountrySelectOptionProps) {
  const handleSelect = () => {
    onChange(country);
    onSelectComplete();
  };

  return (
    <CommandItem className="gap-2" onSelect={handleSelect}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm text-foreground/50">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      <Check
        className={cn("ml-auto size-4", country === selectedCountry ? "opacity-100" : "opacity-0")}
      />
    </CommandItem>
  );
}

function FlagComponent({ country, countryName }: RPNInput.FlagProps) {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
      {Flag ? <Flag title={countryName} /> : null}
    </span>
  );
}

export { PhoneInput };
