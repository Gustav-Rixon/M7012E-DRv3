using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class IsTouching : MonoBehaviour
{
    public void onCollisionBegin(Collision collision){
        Debug.Log("Collision");
    }
}
