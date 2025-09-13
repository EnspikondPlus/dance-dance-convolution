import numpy as np

# Define landmark groups
BODY_PARTS = {
    "head": [0, 1, 2, 3, 4],
    "torso": [11, 12, 23, 24],       # Example: shoulders & hips
    "arms": [5, 6, 7, 8, 9, 10, 13, 14, 15, 16]  # Example: elbows & wrists
}

def normalize_pose(pose):
    try:
        coords = np.array([[lm["x"], lm["y"], lm["z"]] for lm in pose])
        max_index = max([i for part in BODY_PARTS.values() for i in part])
        if max_index >= len(coords):
            return None

        # Center at midpoint of torso (shoulders/hips)
        torso_ids = BODY_PARTS["torso"]
        torso_mid = np.mean(coords[torso_ids], axis=0)
        coords -= torso_mid

        # Scale by torso width (distance between shoulders)
        torso_width = np.linalg.norm(coords[11] - coords[12])
        if torso_width > 0:
            coords /= torso_width

        return coords
    except (IndexError, KeyError, TypeError):
        return None

def part_similarity(coords1, coords2, landmark_ids):
    try:
        diffs = [np.linalg.norm(coords1[i] - coords2[i]) for i in landmark_ids]
        mean_distance = np.mean(diffs)
        # Convert distance to similarity in range [0,1]
        similarity = 1 / (1 + mean_distance)
        return similarity
    except (IndexError, TypeError):
        return None

def pipeline_similarity(pose1, pose2):
    """
    Compute overall similarity using head, torso, and arms.
    Returns a normalized score between 0 and 1.
    """
    coords1 = normalize_pose(pose1)
    coords2 = normalize_pose(pose2)

    similarities = []
    for part, ids in BODY_PARTS.items():
        sim = part_similarity(coords1, coords2, ids)
        if sim is not None:
            similarities.append(sim)

    # Average similarity across all parts
    sim_score = np.mean(similarities)

    sim_score = 1.0 - max(0.0, min(1.0, sim_score))

    return sim_score
