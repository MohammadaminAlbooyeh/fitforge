from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class NutritionLogCreate(BaseModel):
    log_date: date
    meal: Optional[str] = None
    food_item: str
    calories: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0


class NutritionLogUpdate(BaseModel):
    meal: Optional[str] = None
    food_item: Optional[str] = None
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None


class NutritionLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    log_date: date
    meal: Optional[str] = None
    food_item: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float


class DailyNutritionSummary(BaseModel):
    log_date: date
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float