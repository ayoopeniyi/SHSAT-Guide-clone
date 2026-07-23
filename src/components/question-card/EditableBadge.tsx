import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { X, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { toast } from 'sonner';

interface EditableBadgeProps {
  label: string;
  value: string | null;
  badgeVariant?: "default" | "secondary" | "outline";
  badgeClassName?: string;
  onRemove: () => void;
  onAdd: (value: any) => void;
  options: Array<{ id: number | string; title: string; [key: string]: any }>;
  placeholder?: string;
  disabled?: boolean;
}

export const EditableBadge: React.FC<EditableBadgeProps> = ({
  label,
  value,
  badgeVariant = "outline",
  badgeClassName = "",
  onRemove,
  onAdd,
  options,
  placeholder = `Select ${label}`,
  disabled = false
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOptionSelect = (option: any) => {
    onAdd(option);
    setIsDropdownOpen(false);
  };

  const handleRemove = () => {
    onRemove();
  };

  return (
    <div className="inline-flex items-center gap-1">
      {value ? (
        <div className="flex items-center gap-1">
          <Badge variant={badgeVariant} className={`${badgeClassName} pr-1`}>
            {value}
          </Badge>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove {label}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this {label.toLowerCase()}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemove}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-dashed border-gray-300 rounded-md"
              disabled={disabled || options.length === 0}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add {label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <DropdownMenuItem disabled>
                No {label.toLowerCase()} available
              </DropdownMenuItem>
            ) : (
              options.map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  className="cursor-pointer"
                >
                  {option.title}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
