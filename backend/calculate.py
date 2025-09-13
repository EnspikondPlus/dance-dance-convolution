import numpy as np

# Only head landmarks
BODY_PARTS = {
    "head": [0, 1, 2, 3, 4]
}

def normalize_pose(pose):
    try:
        coords = np.array([[lm["x"], lm["y"], lm["z"]] for lm in pose])
        # Ensure required landmarks exist
        required_ids = [0, 1, 2, 3, 4]
        if max(required_ids) >= len(coords):
            return None

        # Center at midpoint of head (landmarks 0-4)
        head_mid = np.mean(coords[required_ids], axis=0)
        coords -= head_mid

        # Scale by head width (distance between left and right side landmarks)
        head_width = np.linalg.norm(coords[1] - coords[2])
        if head_width > 0:
            coords /= head_width

        return coords
    except (IndexError, KeyError, TypeError):
        return None

def part_similarity(coords1, coords2, landmark_ids):
    try:
        diffs = [np.linalg.norm(coords1[i] - coords2[i]) for i in landmark_ids]
        return np.mean(diffs)
    except (IndexError, TypeError):
        return None

def pipeline_similarity(pose1, pose2, prev_score):
    """
    Compute similarity between pose1 and pose2 using head landmarks only,
    and combine it with prev_score.
    Returns prev_score if necessary points are missing.
    """
    coords1 = normalize_pose(pose1)
    coords2 = normalize_pose(pose2)

    if coords1 is None or coords2 is None:
        return prev_score  # fallback if pose data is incomplete

    sim = part_similarity(coords1, coords2, BODY_PARTS["head"])
    if sim is None:
        return prev_score

    final_score = (sim + prev_score) / 2
    return final_score
