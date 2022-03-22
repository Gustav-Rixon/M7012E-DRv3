using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using Leap;
using Leap.Unity;
// this file is intended to be used with a leapmotion controller, developed with ultraleap motion software version v5.3.1-0d83c9b8
// and with unity 2020.3.30f1, to contact and send requests to a custom webpage to command a Double Robotics v3 robot.
public class ControllMove : MonoBehaviour 
{
    Controller controller;                  // leapmotion instant
    Leap.Vector HandPalmPosition;           // get and track the position of the handpalm
    float time = 0.0f;
    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame in unity, to continously track the position of the hand.
    // can track two hands but will prioritize the left one if multiple on screen.
    // will only use one hands position to call functions
    // the tracking is every frame but calls are only sent every 200 ms since that is recommended for DRv3
    // x and y coordinates are equivalent of the positions of the user interface in unity, if those are moved these values need to be updated
    void Update()
    {
        controller = new Controller();
        Frame frame = controller.Frame();
        List<Hand> hands = frame.Hands;
        if (frame.Hands.Count > 0)
        {
            HandPalmPosition = hands[0].PalmPosition;
            if (time >= 0.2f)
            {
                time = 0.0f;
                Debug.Log(HandPalmPosition);
                Debug.Log("test x :" + (HandPalmPosition[0]));
                Debug.Log("text y :" + (HandPalmPosition[1]));
                if (HandPalmPosition[2] < 35)
                {
                    Debug.Log("close enough");
                    if (-70 < HandPalmPosition[0] && HandPalmPosition[0] < 70 && 120 < HandPalmPosition[1] && HandPalmPosition[1] < 250)
                    {
                        Debug.Log("back");
                        StartCoroutine(SendRequest("http://130.240.114.93:3000/driveBackward"));
                    }
                    else if (-70 < HandPalmPosition[0] && HandPalmPosition[0] < 70 && 480 < HandPalmPosition[1] && HandPalmPosition[1] < 615)
                    {
                        Debug.Log("forward");
                        StartCoroutine(SendRequest("http://130.240.114.93:3000/driveForward"));
                    }
                    else if (120 < HandPalmPosition[0] && HandPalmPosition[0] < 230 && 120 < HandPalmPosition[1] && HandPalmPosition[1] < 250)
                    {
                        Debug.Log("up");
                        StartCoroutine(SendRequest("http://130.240.114.93:3000/poleStand"));
                    }
                    else if (120 < HandPalmPosition[0] && HandPalmPosition[0] < 230 && 280 < HandPalmPosition[1] && HandPalmPosition[1] < 430)
                    {
                        Debug.Log("right");
                        StartCoroutine(SendRequest("http://130.240.114.93:3000/turnRight"));
                    }
                    else if (-230 < HandPalmPosition[0] && HandPalmPosition[0] < -110 && 120 < HandPalmPosition[1] && HandPalmPosition[1] < 250)
                    {
                        Debug.Log("down");
                        StartCoroutine(SendRequest("http://130.240.114.93:3000/poleSit"));
                    }
                    else if (-230 < HandPalmPosition[0] && HandPalmPosition[0] < -110 && 280 < HandPalmPosition[1] && HandPalmPosition[1] < 430)
                    {
                        Debug.Log("left");
                        StartCoroutine(SendRequest("http://130.240.114.93:3000/turnLeft"));
                    }
                    else if (-230 < HandPalmPosition[0] && HandPalmPosition[0] < -110 && 480 < HandPalmPosition[1] && HandPalmPosition[1] < 615)
                    {
                        Debug.Log("enable nav");
                        StartCoroutine(SendRequest("http://130.240.114.93:3000/enableNavigation"));
                    }
                    else if (120 < HandPalmPosition[0] && HandPalmPosition[0] < 230 && 480 < HandPalmPosition[1] && HandPalmPosition[1] < 615)
                    {
                        Debug.Log("stop pole");
                        StartCoroutine(SendRequest("http://130.240.114.93:3000/poleStop"));
                    }
                }
            }
        }
        time += UnityEngine.Time.deltaTime;
        
    }
    // used to connect to and send request to a webpage to control the robot
    IEnumerator SendRequest(string url)
    {
        UnityWebRequest request = UnityWebRequest.Get(url);
        yield return request.SendWebRequest();

        if (request.isNetworkError || request.isHttpError)
        {
            Debug.LogError(string.Format("Error: {0}",request.error));
        }

        else
        {
            // Response can be accessed through: request.downloadHandler.text
            Debug.Log(request.downloadHandler.text);
        }
    }
}
