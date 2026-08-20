"""Static exercise library seed data.

Sourced from `app/seed/data/fitforge_exercise_seed.xlsx` - a curated 74-exercise
spreadsheet (10 muscle groups, 4-11 exercises each):
target_muscle_group, secondary_muscle_group(s), equipment_required, movement_role
(compound/isolation), difficulty, video_url (left empty - fill in later with licensed
demo clips), image_url (external image URL - fill in per exercise). This is a starting
seed, not exhaustive - grow it over time.

``alternative_exercise_id`` isn't in the source data, so it's computed here: each
exercise is auto-paired with another exercise targeting the same muscle group,
preferring one on different equipment (ideally bodyweight, so there's always a
no-equipment substitute) over an exact equipment match.

Run with: ``python -m app.seed`` (idempotent - upserts by name).
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.exercise import DifficultyLevel, EquipmentType, Exercise, MovementRole, MuscleGroup

# (name, muscle_group, secondary_muscle_groups, equipment, difficulty, movement_role, image_url?)
EXERCISES: list[
    tuple[str, MuscleGroup, list[MuscleGroup], EquipmentType, DifficultyLevel, MovementRole, str | None]
] = [
    ("Barbell Bench Press", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg"),
    ("Incline Barbell Bench Press", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg"),
    ("Dumbbell Bench Press", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg"),
    ("Incline Dumbbell Press", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg"),
    ("Push-Up", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push-Up_Wide/0.jpg"),
    ("Dumbbell Chest Fly", MuscleGroup.chest, [MuscleGroup.shoulders], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg"),
    ("Cable Chest Fly", MuscleGroup.chest, [MuscleGroup.shoulders], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Cable_Flyes/0.jpg"),
    ("Chest Dip", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.bodyweight, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/0.jpg"),
    ("Machine Chest Press", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/0.jpg"),
    ("Pec Deck Machine", MuscleGroup.chest, [MuscleGroup.shoulders], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/0.jpg"),

    ("Pull-Up", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.bodyweight, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Pull_Ups/0.jpg"),
    ("Lat Pulldown", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg"),
    ("Chin-Up", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.bodyweight, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/0.jpg"),
    ("Straight-Arm Pulldown", MuscleGroup.back, [MuscleGroup.shoulders], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/0.jpg"),
    ("Barbell Bent-Over Row", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg"),
    ("Dumbbell Row", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg"),
    ("Seated Cable Row", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg"),
    ("T-Bar Row", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/T-Bar_Row_with_Handle/0.jpg"),
    ("Machine Row", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Iso_Row/0.jpg"),
    ("Barbell Deadlift", MuscleGroup.back, [MuscleGroup.hamstrings, MuscleGroup.glutes], EquipmentType.barbell, DifficultyLevel.advanced, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg"),
    ("Face Pull", MuscleGroup.back, [MuscleGroup.shoulders], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg"),
    # No exercise above covers a beginner-friendly bodyweight "pull" pattern
    # (Pull-Up/Chin-Up are intermediate) - without these, bodyweight-only
    # beginners get an empty Pull/Back day. Filling that real gap here.
    ("Inverted Row", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/0.jpg"),
    ("Superman", MuscleGroup.back, [MuscleGroup.glutes], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Superman/0.jpg"),

    ("Overhead Barbell Press", MuscleGroup.shoulders, [MuscleGroup.triceps], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shoulder_Press/0.jpg"),
    ("Seated Dumbbell Shoulder Press", MuscleGroup.shoulders, [MuscleGroup.triceps], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg"),
    ("Arnold Press", MuscleGroup.shoulders, [MuscleGroup.triceps], EquipmentType.dumbbell, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/0.jpg"),
    ("Lateral Raise", MuscleGroup.shoulders, [], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg"),
    ("Cable Lateral Raise", MuscleGroup.shoulders, [], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/0.jpg"),
    ("Front Raise", MuscleGroup.shoulders, [], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/0.jpg"),
    ("Rear Delt Fly", MuscleGroup.shoulders, [MuscleGroup.back], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Flyes/0.jpg"),
    ("Machine Shoulder Press", MuscleGroup.shoulders, [MuscleGroup.triceps], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Shoulder_Military_Press/0.jpg"),
    ("Upright Row", MuscleGroup.shoulders, [MuscleGroup.back], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/0.jpg"),
    # No bodyweight shoulder exercise above - without this, bodyweight-only
    # beginners get an empty shoulder slot on Full Body/Upper/Push days.
    ("Pike Push-Up", MuscleGroup.shoulders, [MuscleGroup.triceps], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/0.jpg"),

    ("Barbell Curl", MuscleGroup.biceps, [], EquipmentType.barbell, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg"),
    ("Dumbbell Curl", MuscleGroup.biceps, [], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/0.jpg"),
    ("Hammer Curl", MuscleGroup.biceps, [], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg"),
    ("Cable Curl", MuscleGroup.biceps, [], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Biceps_Cable_Curl/0.jpg"),
    ("Preacher Curl", MuscleGroup.biceps, [], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/0.jpg"),
    ("Concentration Curl", MuscleGroup.biceps, [], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/0.jpg"),

    ("Triceps Pushdown", MuscleGroup.triceps, [], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg"),
    ("Skull Crusher", MuscleGroup.triceps, [], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Skullcrusher/0.jpg"),
    ("Overhead Triceps Extension", MuscleGroup.triceps, [], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Triceps/0.jpg"),
    ("Close-Grip Bench Press", MuscleGroup.triceps, [MuscleGroup.chest], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/0.jpg"),
    ("Triceps Dip", MuscleGroup.triceps, [MuscleGroup.chest], EquipmentType.bodyweight, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Triceps_Version/0.jpg"),
    ("Cable Overhead Extension", MuscleGroup.triceps, [], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Overhead_Triceps_Extension/0.jpg"),
    # The only bodyweight triceps exercise above (Triceps Dip) is intermediate;
    # this fills the beginner-bodyweight gap.
    ("Bench Dip", MuscleGroup.triceps, [MuscleGroup.shoulders], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/0.jpg"),

    ("Barbell Back Squat", MuscleGroup.quads, [MuscleGroup.glutes, MuscleGroup.hamstrings], EquipmentType.barbell, DifficultyLevel.advanced, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg"),
    ("Front Squat", MuscleGroup.quads, [MuscleGroup.glutes], EquipmentType.barbell, DifficultyLevel.advanced, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat/0.jpg"),
    ("Leg Press", MuscleGroup.quads, [MuscleGroup.glutes, MuscleGroup.hamstrings], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg"),
    ("Walking Lunge", MuscleGroup.quads, [MuscleGroup.glutes, MuscleGroup.hamstrings], EquipmentType.dumbbell, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg"),
    ("Bulgarian Split Squat", MuscleGroup.quads, [MuscleGroup.glutes, MuscleGroup.hamstrings], EquipmentType.dumbbell, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squat_with_Dumbbells/0.jpg"),
    ("Leg Extension", MuscleGroup.quads, [], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg"),
    ("Goblet Squat", MuscleGroup.quads, [MuscleGroup.glutes], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg"),
    ("Hack Squat", MuscleGroup.quads, [MuscleGroup.glutes], EquipmentType.machine, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hack_Squat/0.jpg"),
    # No bodyweight quad exercise above - a real gap for bodyweight-only users.
    ("Bodyweight Squat", MuscleGroup.quads, [MuscleGroup.glutes], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Squat/0.jpg"),

    ("Romanian Deadlift", MuscleGroup.hamstrings, [MuscleGroup.glutes, MuscleGroup.back], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg"),
    ("Dumbbell RDL", MuscleGroup.hamstrings, [MuscleGroup.glutes, MuscleGroup.back], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg"),
    ("Lying Leg Curl", MuscleGroup.hamstrings, [], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg"),
    ("Seated Leg Curl", MuscleGroup.hamstrings, [], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/0.jpg"),
    ("Good Morning", MuscleGroup.hamstrings, [MuscleGroup.back, MuscleGroup.glutes], EquipmentType.barbell, DifficultyLevel.advanced, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/0.jpg"),
    ("Nordic Curl", MuscleGroup.hamstrings, [], EquipmentType.bodyweight, DifficultyLevel.advanced, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ball_Leg_Curl/0.jpg"),

    ("Hip Thrust", MuscleGroup.glutes, [MuscleGroup.hamstrings], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg"),
    ("Glute Bridge", MuscleGroup.glutes, [MuscleGroup.hamstrings], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Glute_Bridge/0.jpg"),
    ("Cable Kickback", MuscleGroup.glutes, [], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Legged_Cable_Kickback/0.jpg"),
    ("Step-Up", MuscleGroup.glutes, [MuscleGroup.quads], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Step_Ups/0.jpg"),

    ("Standing Calf Raise", MuscleGroup.calves, [], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg"),
    ("Seated Calf Raise", MuscleGroup.calves, [], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/0.jpg"),
    ("Dumbbell Calf Raise", MuscleGroup.calves, [], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Calf_Raise/0.jpg"),
    ("Bodyweight Calf Raise", MuscleGroup.calves, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rocking_Standing_Calf_Raise/0.jpg"),

    ("Plank", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg"),
    ("Hanging Leg Raise", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.intermediate, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg"),
    ("Cable Crunch", MuscleGroup.core, [], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg"),
    ("Russian Twist", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/0.jpg"),
    ("Bicycle Crunch", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Air_Bike/0.jpg"),
    ("Ab Wheel Rollout", MuscleGroup.core, [MuscleGroup.shoulders], EquipmentType.bodyweight, DifficultyLevel.advanced, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Roller/0.jpg"),
    ("Side Plank", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Up_to_Side_Plank/0.jpg"),
    ("Mountain Climber", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain_Climbers/0.jpg"),
    ("Sit-Up", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sit-Up/0.jpg"),
    ("Flutter Kick", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flutter_Kicks/0.jpg"),

    # Kettlebell had zero entries before this - equipment-filtered plan
    # generation silently fell back to bodyweight-only for anyone who
    # selected it, with no kettlebell exercises ever appearing.
    ("Kettlebell Front Squat", MuscleGroup.quads, [MuscleGroup.glutes], EquipmentType.kettlebell, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Squats_With_Two_Kettlebells/0.jpg"),
    ("Kettlebell Swing", MuscleGroup.hamstrings, [MuscleGroup.glutes, MuscleGroup.core], EquipmentType.kettlebell, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Swings/0.jpg"),
    ("Kettlebell Row", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.kettlebell, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Row/0.jpg"),
    ("Kettlebell Floor Press", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.kettlebell, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Kettlebell_Floor_Press/0.jpg"),
    ("Kettlebell Seated Press", MuscleGroup.shoulders, [MuscleGroup.triceps], EquipmentType.kettlebell, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Seated_Press/0.jpg"),
    ("Kettlebell Figure 8", MuscleGroup.core, [], EquipmentType.kettlebell, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Figure_8/0.jpg"),
    ("Kettlebell Single-Leg Deadlift", MuscleGroup.glutes, [MuscleGroup.hamstrings], EquipmentType.kettlebell, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_One-Legged_Deadlift/0.jpg"),

    # Machine coverage was thin/absent for core, biceps, and triceps, and
    # only one option each for chest/back/shoulders/quads - not enough for a
    # standard-commercial-gym plan to vary across repeated day types
    # (Full Body A/B/C, Upper A/B) without falling back to free weights.
    ("Ab Crunch Machine", MuscleGroup.core, [], EquipmentType.machine, DifficultyLevel.intermediate, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/0.jpg"),
    ("Machine Bicep Curl", MuscleGroup.biceps, [], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bicep_Curl/0.jpg"),
    ("Machine Preacher Curl", MuscleGroup.biceps, [], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Preacher_Curls/0.jpg"),
    ("Machine Triceps Extension", MuscleGroup.triceps, [], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/0.jpg"),
    ("Dip Machine", MuscleGroup.triceps, [MuscleGroup.chest], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dip_Machine/0.jpg"),
    ("Machine Incline Chest Press", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Incline_Chest_Press/0.jpg"),
    ("Machine High Row", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_High_Row/0.jpg"),
    ("Machine Shoulder Press (Leverage)", MuscleGroup.shoulders, [MuscleGroup.triceps], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shoulder_Press/0.jpg"),
    ("Machine Squat", MuscleGroup.quads, [MuscleGroup.glutes], EquipmentType.machine, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Machine_Squat/0.jpg"),

    # A second round of machine additions: core, shoulders, and triceps only
    # had one or two options each, which meant a machine-only 5-day
    # Upper/Lower split still had to repeat a slot's exercise across two of
    # the three upper days (or two of the two lower days).
    ("Machine Hip Raise", MuscleGroup.core, [], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Hip_Raise/0.jpg"),
    ("Reverse Machine Fly", MuscleGroup.shoulders, [MuscleGroup.back], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Machine_Flyes/0.jpg"),
    ("Smith Machine Close-Grip Bench Press", MuscleGroup.triceps, [MuscleGroup.chest, MuscleGroup.shoulders], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Close-Grip_Bench_Press/0.jpg"),
    # Glutes only had one machine/cable option (Cable Kickback), which forced
    # a repeat across a 2-lower-day machine+cable-only week.
    ("Cable Pull Through", MuscleGroup.glutes, [MuscleGroup.hamstrings], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pull_Through/0.jpg"),

    # Quads/hamstrings had zero cable options and only one bodyweight option
    # each - a cable-only (or bodyweight-only) week couldn't avoid repeating
    # those two slots even across just 2-3 consecutive days.
    ("Cable Deadlift", MuscleGroup.quads, [MuscleGroup.hamstrings, MuscleGroup.glutes], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Deadlifts/0.jpg"),
    ("Cable Hip Adduction", MuscleGroup.quads, [], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hip_Adduction/0.jpg"),
    ("Walking Lunge", MuscleGroup.quads, [MuscleGroup.glutes], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Walking_Lunge/0.jpg"),
    ("Natural Glute Ham Raise", MuscleGroup.hamstrings, [MuscleGroup.glutes], EquipmentType.bodyweight, DifficultyLevel.intermediate, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Natural_Glute_Ham_Raise/0.jpg"),
    # Shoulders only had one cable option (Cable Lateral Raise) - a
    # cable-only week would repeat it every single day.
    ("Cable Shoulder Press", MuscleGroup.shoulders, [MuscleGroup.triceps], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Shoulder_Press/0.jpg"),
    ("Front Cable Raise", MuscleGroup.shoulders, [], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Cable_Raise/0.jpg"),
    # No cable hamstring exercise exists in the source dataset at all, so a
    # cable-only selection always falls back to bodyweight for this slot -
    # a second bodyweight option at least stops it being the exact same one.
    ("Split Squat", MuscleGroup.hamstrings, [MuscleGroup.glutes, MuscleGroup.quads], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.compound, "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Split_Squats/0.jpg"),
]


def get_seed_rows():
    return EXERCISES


# Short proper-form demo video per exercise (YouTube watch URLs). These are
# embedded under each exercise in the app ("Watch demo"). Swap for licensed
# clips when available.
VIDEO_URLS: dict[str, str] = {
    "Barbell Bench Press": "https://www.youtube.com/watch?v=hWbUlkb5Ms4",
    "Incline Barbell Bench Press": "https://www.youtube.com/watch?v=kQtx01Qz6s8",
    "Dumbbell Bench Press": "https://www.youtube.com/watch?v=oWDtW7_J8qE",
    "Incline Dumbbell Press": "https://www.youtube.com/watch?v=sK4Rvug6ufo",
    "Push-Up": "https://www.youtube.com/watch?v=3nnzOvAAbP8",
    "Dumbbell Chest Fly": "https://www.youtube.com/watch?v=98aRvyw-IGg",
    "Cable Chest Fly": "https://www.youtube.com/watch?v=Iwe6AmxVf7o",
    "Chest Dip": "https://www.youtube.com/watch?v=xa3YhVZqBVw",
    "Machine Chest Press": "https://www.youtube.com/watch?v=xUm0BiZCWlQ",
    "Pec Deck Machine": "https://www.youtube.com/watch?v=hZ0CGRaKwbQ",
    "Pull-Up": "https://www.youtube.com/watch?v=tNV6-iUDHO4",
    "Lat Pulldown": "https://www.youtube.com/watch?v=shtopiwqaDg",
    "Chin-Up": "https://www.youtube.com/watch?v=TaJN78G4PPk",
    "Straight-Arm Pulldown": "https://www.youtube.com/watch?v=soX7zhZ7yfQ",
    "Barbell Bent-Over Row": "https://www.youtube.com/watch?v=FWJR5Ve8bnQ",
    "Dumbbell Row": "https://www.youtube.com/watch?v=pYcpY20QaE8",
    "Seated Cable Row": "https://www.youtube.com/watch?v=7o2oolbmzeI",
    "T-Bar Row": "https://www.youtube.com/watch?v=j3Igk5nyZE4",
    "Machine Row": "https://www.youtube.com/watch?v=FU6YQawma2Q",
    "Barbell Deadlift": "https://www.youtube.com/watch?v=ZaTM37cfiDs",
    "Face Pull": "https://www.youtube.com/watch?v=rep-qVOkqgk",
    "Inverted Row": "https://www.youtube.com/watch?v=XZV9IwluPjw",
    "Superman": "https://www.youtube.com/watch?v=z6PJMT2y8GQ",
    "Overhead Barbell Press": "https://www.youtube.com/watch?v=nNMR9fRGRjQ",
    "Seated Dumbbell Shoulder Press": "https://www.youtube.com/watch?v=nHboL27_Sn0",
    "Arnold Press": "https://www.youtube.com/watch?v=6Z15_WdXmVw",
    "Lateral Raise": "https://www.youtube.com/watch?v=3VcKaXpzqRo",
    "Cable Lateral Raise": "https://www.youtube.com/watch?v=Z5FA9aq3L6A",
    "Front Raise": "https://www.youtube.com/watch?v=-t7fuZ0KhDA",
    "Rear Delt Fly": "https://www.youtube.com/watch?v=EA7u4Q_8HQ0",
    "Machine Shoulder Press": "https://www.youtube.com/watch?v=WvLMauqrnK8",
    "Upright Row": "https://www.youtube.com/watch?v=jaAV-rD45I0",
    "Pike Push-Up": "https://www.youtube.com/watch?v=0cT6ug3WVn4",
    "Barbell Curl": "https://www.youtube.com/watch?v=dDI8ClxRS04",
    "Dumbbell Curl": "https://www.youtube.com/watch?v=av7-8igSXTs",
    "Hammer Curl": "https://www.youtube.com/watch?v=CFBZ4jN1CMI",
    "Cable Curl": "https://www.youtube.com/watch?v=rfRdD5PKrko",
    "Preacher Curl": "https://www.youtube.com/watch?v=RgN216Cumtw",
    "Concentration Curl": "https://www.youtube.com/watch?v=Jvj2wV0vOYU",
    "Triceps Pushdown": "https://www.youtube.com/watch?v=_w-HpW70nSQ",
    "Skull Crusher": "https://www.youtube.com/watch?v=YUhzqUVB24I",
    "Overhead Triceps Extension": "https://www.youtube.com/watch?v=O7e8j8K3cJo",
    "Close-Grip Bench Press": "https://www.youtube.com/watch?v=nEF0bv2FW94",
    "Triceps Dip": "https://www.youtube.com/watch?v=8UugSoVJLag",
    "Cable Overhead Extension": "https://www.youtube.com/watch?v=GzmlxvSFE7A",
    "Bench Dip": "https://www.youtube.com/watch?v=c3ZGl4pAwZ4",
    "Barbell Back Squat": "https://www.youtube.com/watch?v=PPmvh7gBTi0",
    "Front Squat": "https://www.youtube.com/watch?v=-L5mDFdsgZo",
    "Leg Press": "https://www.youtube.com/watch?v=K5n2vg3oZa4",
    "Walking Lunge": "https://www.youtube.com/watch?v=vYfp2t4XgqQ",
    "Bulgarian Split Squat": "https://www.youtube.com/watch?v=2C-uNgKwPLE",
    "Leg Extension": "https://www.youtube.com/watch?v=YyvSfVjQeL0",
    "Goblet Squat": "https://www.youtube.com/watch?v=MeIiIdhvXT4",
    "Hack Squat": "https://www.youtube.com/watch?v=eT9UyM6vzSo",
    "Bodyweight Squat": "https://www.youtube.com/watch?v=P-yaD24bUE8",
    "Romanian Deadlift": "https://www.youtube.com/watch?v=KN5vN3JskqI",
    "Dumbbell RDL": "https://www.youtube.com/watch?v=hQgFixeXdZo",
    "Lying Leg Curl": "https://www.youtube.com/watch?v=733b9_GUm9A",
    "Seated Leg Curl": "https://www.youtube.com/watch?v=14OrOWlM5QU",
    "Good Morning": "https://www.youtube.com/watch?v=vKPGe8zb2S4",
    "Nordic Curl": "https://www.youtube.com/watch?v=nn743teTMTc",
    "Hip Thrust": "https://www.youtube.com/watch?v=LM8XHLYJoYs",
    "Glute Bridge": "https://www.youtube.com/watch?v=8bbE64NuDTU",
    "Cable Kickback": "https://www.youtube.com/watch?v=dU1R-AHW4IM",
    "Step-Up": "https://www.youtube.com/watch?v=vOiHvzj5XhA",
    "Standing Calf Raise": "https://www.youtube.com/watch?v=YMmgqO8Jo-k",
    "Seated Calf Raise": "https://www.youtube.com/watch?v=ORY-ke6vcgk",
    "Dumbbell Calf Raise": "https://www.youtube.com/watch?v=wxwY7GXxL4k",
    "Bodyweight Calf Raise": "https://www.youtube.com/watch?v=k8ipHzKeAkQ",
    "Plank": "https://www.youtube.com/watch?v=pSHjTRCQxIw",
    "Hanging Leg Raise": "https://www.youtube.com/watch?v=Pr1ieGZ5atk",
    "Cable Crunch": "https://www.youtube.com/watch?v=ToJeyhydUxU",
    "Russian Twist": "https://www.youtube.com/watch?v=wkD8rjkodUI",
    "Bicycle Crunch": "https://www.youtube.com/watch?v=Iwyvozckjak",
    "Ab Wheel Rollout": "https://www.youtube.com/watch?v=rqiTPdK1c_I",
    "Side Plank": "https://www.youtube.com/watch?v=V2cUr7zG4hw",
    "Mountain Climber": "https://www.youtube.com/watch?v=nmwgirgXLYM",
    "Sit-Up": "https://www.youtube.com/watch?v=jDwoBqPH0jk",
    "Flutter Kick": "https://www.youtube.com/watch?v=ocRe4ccKeK4",
}


def _pick_alternative(name: str, muscle_group: MuscleGroup, equipment: EquipmentType) -> str | None:
    """Pick another exercise in the same muscle group, preferring a different
    (ideally bodyweight) equipment type so there's always a no-equipment substitute."""
    same_group = [r for r in EXERCISES if r[1] == muscle_group and r[0] != name]
    if not same_group:
        return None

    different_equipment = [r for r in same_group if r[3] != equipment]
    bodyweight = [r for r in different_equipment if r[3] == EquipmentType.bodyweight]

    pool = bodyweight or different_equipment or same_group
    return sorted(pool, key=lambda r: r[0])[0][0]


def seed_exercises(db: Session) -> tuple[int, int]:
    """Idempotently upsert the exercise library by name. Returns (created, updated)."""
    existing = {e.name: e for e in db.execute(select(Exercise)).scalars()}
    created = 0
    updated = 0

    for name, muscle_group, secondary_groups, equipment, difficulty, movement_role, image_url in EXERCISES:
        secondary_values = [g.value for g in secondary_groups] or None
        row = existing.get(name)
        if row is None:
            row = Exercise(
                name=name,
                muscle_group=muscle_group,
                secondary_muscle_groups=secondary_values,
                equipment=equipment,
                difficulty=difficulty,
                movement_role=movement_role,
                image_url=image_url,
                video_url=VIDEO_URLS.get(name),
            )
            db.add(row)
            existing[name] = row
            created += 1
        else:
            row.muscle_group = muscle_group
            row.secondary_muscle_groups = secondary_values
            row.equipment = equipment
            row.difficulty = difficulty
            row.movement_role = movement_role
            row.image_url = image_url
            row.video_url = VIDEO_URLS.get(name)
            updated += 1

    db.flush()

    for name, muscle_group, _secondary, equipment, _difficulty, _role, _image_url in EXERCISES:
        alt_name = _pick_alternative(name, muscle_group, equipment)
        if alt_name is not None:
            existing[name].alternative_exercise_id = existing[alt_name].id

    db.commit()
    return created, updated
